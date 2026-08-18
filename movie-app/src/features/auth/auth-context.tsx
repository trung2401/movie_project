'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  AuthTokens,
  AuthUser,
  login,
  refreshAccessToken,
  register,
  UserApiError,
} from '@/services/userApi'

const SESSION_STORAGE_KEY = 'movie-app.user-session'

interface UserSession extends AuthTokens {}

interface AuthContextValue {
  session: UserSession | null
  isReady: boolean
  authDialogOpen: boolean
  accountDrawerOpen: boolean
  openAuthDialog: () => void
  closeAuthDialog: () => void
  openAccountDrawer: () => void
  closeAccountDrawer: () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => void
  runAuthenticated: <T>(operation: (accessToken: string) => Promise<T>) => Promise<T>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isUserSession(value: unknown): value is UserSession {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<UserSession>
  return Boolean(
    session.accessToken &&
      session.refreshToken &&
      session.user?.id &&
      session.user.email,
  )
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super('Vui lòng đăng nhập để tiếp tục.')
    this.name = 'AuthenticationRequiredError'
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false)

  useEffect(() => {
    const restoreSessionId = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(SESSION_STORAGE_KEY)
        if (stored) {
          const parsed: unknown = JSON.parse(stored)
          if (isUserSession(parsed)) setSession(parsed)
        }
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY)
      } finally {
        setIsReady(true)
      }
    }, 0)

    return () => window.clearTimeout(restoreSessionId)
  }, [])

  const persistSession = useCallback((nextSession: UserSession | null) => {
    setSession(nextSession)
    if (nextSession) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }, [])

  const completeAuthentication = useCallback(
    (tokens: AuthTokens) => {
      persistSession(tokens)
      setAuthDialogOpen(false)
    },
    [persistSession],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      completeAuthentication(await login(email, password))
    },
    [completeAuthentication],
  )

  const signUp = useCallback(
    async (email: string, password: string) => {
      completeAuthentication(await register(email, password))
    },
    [completeAuthentication],
  )

  const signOut = useCallback(() => {
    persistSession(null)
    setAccountDrawerOpen(false)
  }, [persistSession])

  const runAuthenticated = useCallback(
    async <T,>(operation: (accessToken: string) => Promise<T>): Promise<T> => {
      if (!session) throw new AuthenticationRequiredError()

      try {
        return await operation(session.accessToken)
      } catch (error) {
        if (!(error instanceof UserApiError) || error.status !== 401) throw error

        try {
          const refreshed = await refreshAccessToken(session.refreshToken)
          const nextSession = { ...session, accessToken: refreshed.accessToken }
          persistSession(nextSession)
          return await operation(nextSession.accessToken)
        } catch {
          signOut()
          throw new AuthenticationRequiredError()
        }
      }
    },
    [persistSession, session, signOut],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isReady,
      authDialogOpen,
      accountDrawerOpen,
      openAuthDialog: () => setAuthDialogOpen(true),
      closeAuthDialog: () => setAuthDialogOpen(false),
      openAccountDrawer: () => setAccountDrawerOpen(true),
      closeAccountDrawer: () => setAccountDrawerOpen(false),
      signIn,
      signUp,
      signOut,
      runAuthenticated,
    }),
    [
      accountDrawerOpen,
      authDialogOpen,
      isReady,
      runAuthenticated,
      session,
      signIn,
      signOut,
      signUp,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function getDisplayName(user: AuthUser): string {
  return user.email.split('@')[0]
}
