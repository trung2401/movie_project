'use client'

import { AccountDrawer } from '@/features/account/components/AccountDrawer'
import { AuthDialog } from './AuthDialog'

export function AuthOverlays() {
  return (
    <>
      <AuthDialog />
      <AccountDrawer />
    </>
  )
}
