'use client'

import { AccountDrawer } from '@/features/account/components/AccountDrawer'
import { UserDataProvider } from '@/features/user-data/user-data-context'

export function AccountDrawerHost() {
  return (
    <UserDataProvider>
      <AccountDrawer />
    </UserDataProvider>
  )
}
