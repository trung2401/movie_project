'use client'

import { UserDataProvider } from './user-data-context'

/**
 * Keeps the user-data context scoped to routes and interactive regions that
 * actually need favorites or watch history.
 */
export function UserDataBoundary({ children }: { children: React.ReactNode }) {
  return <UserDataProvider>{children}</UserDataProvider>
}
