'use client'

import { AlertCircle, Eye, EyeOff, LogIn, UserPlus, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useAuth } from '../auth-context'

type AuthMode = 'login' | 'register'

export function AuthDialog() {
  const { authDialogOpen, closeAuthDialog, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!authDialogOpen) return null

  const isLogin = mode === 'login'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (isLogin) await signIn(email, password)
      else await signUp(email, password)
      setPassword('')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Không thể xác thực tài khoản.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Đóng đăng nhập"
        onClick={closeAuthDialog}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="relative w-full max-w-md border border-[var(--color-line)] bg-[var(--color-panel)] p-5 shadow-2xl shadow-black/40 sm:rounded-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--color-primary-soft)]">
              MovieApp
            </p>
            <h2 id="auth-dialog-title" className="mt-1 text-xl font-black text-white">
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeAuthDialog}
            className="focus-ring inline-flex size-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-panel-soft)] hover:text-white"
            aria-label="Đóng"
            title="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 border-b border-[var(--color-line)]">
          {([
            ['login', 'Đăng nhập'],
            ['register', 'Đăng ký'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => changeMode(value)}
              className={`focus-ring border-b-2 px-3 py-2 text-sm font-bold transition ${
                mode === value
                  ? 'border-[var(--color-primary)] text-white'
                  : 'border-transparent text-[var(--color-muted)] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-white">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              maxLength={254}
              className="focus-ring mt-2 h-11 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-semibold text-white">
            Mật khẩu
            <span className="relative mt-2 block">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={8}
                maxLength={72}
                className="focus-ring h-11 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)] px-3 pr-11 text-sm text-white outline-none transition focus:border-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="focus-ring absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[var(--color-muted)] hover:text-white"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>

          {error && (
            <p className="flex items-start gap-2 border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-soft)] disabled:cursor-wait disabled:opacity-60"
          >
            {isLogin ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
            {submitting ? 'Đang xử lý' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>
      </section>
    </div>
  )
}
