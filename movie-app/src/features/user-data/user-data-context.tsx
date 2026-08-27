'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import {
  createFavorite as createFavoriteRequest,
  deleteFavorite as deleteFavoriteRequest,
  Favorite,
  getContinueWatching,
  getFavoriteStatus,
  getFavorites,
  getWatchHistory,
  saveWatchHistory as saveWatchHistoryRequest,
  WatchHistory,
} from '@/services/userApi'

interface UserCache {
  favorites?: Favorite[]
  favoritesRequest?: Promise<Favorite[]>
  favoriteByMovie: Map<string, Favorite | null>
  favoriteRequests: Map<string, Promise<Favorite | null>>
  history?: WatchHistory[]
  historyRequest?: Promise<WatchHistory[]>
  historyByEpisode: Map<string, WatchHistory | null>
  historyRequests: Map<string, Promise<WatchHistory | null>>
  historySaveRequests: Map<string, Promise<WatchHistory>>
}

interface UserDataContextValue {
  loadFavorites: (force?: boolean) => Promise<Favorite[]>
  loadHistory: (force?: boolean) => Promise<WatchHistory[]>
  getFavoriteStatus: (movieSlug: string) => Promise<Favorite | null>
  createFavorite: (movieSlug: string, movieName: string) => Promise<Favorite>
  deleteFavorite: (movieSlug: string) => Promise<void>
  getWatchHistory: (movieSlug: string, episodeSlug: string) => Promise<WatchHistory | null>
  saveWatchHistory: (
    movieSlug: string,
    movieName: string,
    episodeSlug: string,
    progressSeconds: number,
  ) => Promise<WatchHistory>
}

const UserDataContext = createContext<UserDataContextValue | null>(null)
const userCaches = new Map<string, UserCache>()

function getHistoryKey(movieSlug: string, episodeSlug: string) {
  return `${movieSlug.trim().toLowerCase()}:${episodeSlug.trim().toLowerCase()}`
}

function getUserCache(userId: string): UserCache {
  const existingCache = userCaches.get(userId)
  if (existingCache) return existingCache

  const cache: UserCache = {
    favoriteByMovie: new Map(),
    favoriteRequests: new Map(),
    historyByEpisode: new Map(),
    historyRequests: new Map(),
    historySaveRequests: new Map(),
  }
  userCaches.set(userId, cache)
  return cache
}

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { runAuthenticated, session } = useAuth()
  const [, setRevision] = useState(0)

  const notify = useCallback(() => setRevision((value) => value + 1), [])

  const loadFavorites = useCallback(async (force = false) => {
    if (!session) return []
    const cache = getUserCache(session.user.id)
    if (cache.favoritesRequest) return cache.favoritesRequest
    if (cache.favorites && !force) return cache.favorites

    const request = runAuthenticated(getFavorites)
      .then((response) => {
        cache.favorites = response.items
        cache.favoriteByMovie.clear()
        response.items.forEach((favorite) => cache.favoriteByMovie.set(favorite.movieSlug, favorite))
        notify()
        return response.items
      })
      .finally(() => {
        cache.favoritesRequest = undefined
      })
    cache.favoritesRequest = request
    return request
  }, [notify, runAuthenticated, session])

  const loadHistory = useCallback(async (force = false) => {
    if (!session) return []
    const cache = getUserCache(session.user.id)
    if (cache.historyRequest) return cache.historyRequest
    if (cache.history && !force) return cache.history

    const request = runAuthenticated(getContinueWatching)
      .then((response) => {
        cache.history = response.items
        cache.historyByEpisode.clear()
        response.items.forEach((item) => cache.historyByEpisode.set(getHistoryKey(item.movieSlug, item.episodeSlug), item))
        notify()
        return response.items
      })
      .finally(() => {
        cache.historyRequest = undefined
      })
    cache.historyRequest = request
    return request
  }, [notify, runAuthenticated, session])

  const getFavoriteStatusForMovie = useCallback(async (movieSlug: string) => {
    if (!session) return null
    const normalizedSlug = movieSlug.trim().toLowerCase()
    const cache = getUserCache(session.user.id)
    if (cache.favoriteByMovie.has(normalizedSlug)) return cache.favoriteByMovie.get(normalizedSlug) ?? null
    const pendingRequest = cache.favoriteRequests.get(normalizedSlug)
    if (pendingRequest) return pendingRequest

    const request = runAuthenticated((accessToken) => getFavoriteStatus(accessToken, normalizedSlug))
      .then((favorite) => {
        cache.favoriteByMovie.set(normalizedSlug, favorite)
        notify()
        return favorite
      })
      .finally(() => {
        cache.favoriteRequests.delete(normalizedSlug)
      })
    cache.favoriteRequests.set(normalizedSlug, request)
    return request
  }, [notify, runAuthenticated, session])

  const createFavorite = useCallback(async (movieSlug: string, movieName: string) => {
    if (!session) throw new Error('Vui lòng đăng nhập để tiếp tục.')
    const normalizedSlug = movieSlug.trim().toLowerCase()
    const cache = getUserCache(session.user.id)
    const favorite = await runAuthenticated((accessToken) =>
      createFavoriteRequest(accessToken, normalizedSlug, movieName),
    )
    cache.favoriteByMovie.set(normalizedSlug, favorite)
    if (cache.favorites) {
      cache.favorites = [favorite, ...cache.favorites.filter((item) => item.movieSlug !== normalizedSlug)]
    }
    notify()
    return favorite
  }, [notify, runAuthenticated, session])

  const deleteFavorite = useCallback(async (movieSlug: string) => {
    if (!session) throw new Error('Vui lòng đăng nhập để tiếp tục.')
    const normalizedSlug = movieSlug.trim().toLowerCase()
    const cache = getUserCache(session.user.id)
    await runAuthenticated((accessToken) => deleteFavoriteRequest(accessToken, normalizedSlug))
    cache.favoriteByMovie.set(normalizedSlug, null)
    if (cache.favorites) {
      cache.favorites = cache.favorites.filter((item) => item.movieSlug !== normalizedSlug)
    }
    notify()
  }, [notify, runAuthenticated, session])

  const getWatchHistoryForEpisode = useCallback(async (movieSlug: string, episodeSlug: string) => {
    if (!session) return null
    const normalizedMovieSlug = movieSlug.trim().toLowerCase()
    const normalizedEpisodeSlug = episodeSlug.trim().toLowerCase()
    const historyKey = getHistoryKey(normalizedMovieSlug, normalizedEpisodeSlug)
    const cache = getUserCache(session.user.id)
    if (cache.historyByEpisode.has(historyKey)) return cache.historyByEpisode.get(historyKey) ?? null
    const pendingRequest = cache.historyRequests.get(historyKey)
    if (pendingRequest) return pendingRequest

    const request = runAuthenticated((accessToken) => getWatchHistory(accessToken, normalizedMovieSlug, normalizedEpisodeSlug))
      .then((history) => {
        cache.historyByEpisode.set(historyKey, history)
        notify()
        return history
      })
      .finally(() => {
        cache.historyRequests.delete(historyKey)
      })
    cache.historyRequests.set(historyKey, request)
    return request
  }, [notify, runAuthenticated, session])

  const saveWatchHistory = useCallback(async (
    movieSlug: string,
    movieName: string,
    episodeSlug: string,
    progressSeconds: number,
  ) => {
    if (!session) throw new Error('Vui lòng đăng nhập để tiếp tục.')
    const normalizedMovieSlug = movieSlug.trim().toLowerCase()
    const normalizedEpisodeSlug = episodeSlug.trim().toLowerCase()
    const historyKey = getHistoryKey(normalizedMovieSlug, normalizedEpisodeSlug)
    const cache = getUserCache(session.user.id)
    const pendingRequest = cache.historySaveRequests.get(historyKey)
    if (pendingRequest) return pendingRequest

    const request = runAuthenticated((accessToken) =>
      saveWatchHistoryRequest(accessToken, normalizedMovieSlug, movieName.trim(), normalizedEpisodeSlug, progressSeconds),
    )
      .then((history) => {
        cache.historyByEpisode.set(historyKey, history)
        if (cache.history) {
          cache.history = [history, ...cache.history.filter((item) => getHistoryKey(item.movieSlug, item.episodeSlug) !== historyKey)]
        }
        notify()
        return history
      })
      .finally(() => {
        cache.historySaveRequests.delete(historyKey)
      })
    cache.historySaveRequests.set(historyKey, request)
    return request
  }, [notify, runAuthenticated, session])

  const value = useMemo<UserDataContextValue>(() => ({
    loadFavorites,
    loadHistory,
    getFavoriteStatus: getFavoriteStatusForMovie,
    createFavorite,
    deleteFavorite,
    getWatchHistory: getWatchHistoryForEpisode,
    saveWatchHistory,
  }), [
    createFavorite,
    deleteFavorite,
    getFavoriteStatusForMovie,
    getWatchHistoryForEpisode,
    loadFavorites,
    loadHistory,
    saveWatchHistory,
  ])

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
}

export function useUserData(): UserDataContextValue {
  const context = useContext(UserDataContext)
  if (!context) throw new Error('useUserData must be used within UserDataProvider')
  return context
}
