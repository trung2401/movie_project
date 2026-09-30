'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '../auth-context'

const LazyAuthDialog = dynamic(
  () => import('./AuthDialog').then((module) => module.AuthDialog),
  { ssr: false },
)

const LazyAccountDrawerHost = dynamic(
  () => import('./AccountDrawerHost').then((module) => module.AccountDrawerHost),
  { ssr: false },
)

export function AuthOverlays() {
  const { accountDrawerOpen, authDialogOpen } = useAuth()

  return (
    <>
      {authDialogOpen ? <LazyAuthDialog /> : null}
      {accountDrawerOpen ? <LazyAccountDrawerHost /> : null}
    </>
  )
}
