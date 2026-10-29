'use client'

import { Bug, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const requirements = useMemo(() => [
    ['At least 8 characters', password.length >= 8],
    ['Contains a number', /\d/.test(password)],
    ['Contains a letter', /[a-z]/i.test(password)],
  ] as const, [password])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const data = new FormData(event.currentTarget)
    const response = await fetch('/api/app-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, name: data.get('name'), email: data.get('email'), password }) })
    const result = await response.json()
    setBusy(false)
    if (!response.ok) return setError(result.error)
    const requestedPath = new URLSearchParams(window.location.search).get('next')
    const safePath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : null
    router.push(safePath ?? (mode === 'register' ? '/explore' : '/'))
    router.refresh()
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <img alt="Coastal village overlooking the sea" className="absolute inset-0 h-full w-full object-cover opacity-70" src="https://images.unsplash.com/photo-1770018897269-1b5d1989bd75?auto=format&fit=crop&w=1400&q=90" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/30" />
        <Link className="absolute left-10 top-10 flex items-center gap-2.5 font-bold text-white" href="/"><span className="grid size-10 place-items-center rounded-xl bg-teal-500 text-slate-950"><Bug size={20} /></span><span className="text-xl">Travel Bug</span></Link>
        <div className="absolute inset-x-10 bottom-12 text-white"><p className="font-serif text-4xl font-semibold">“The world is full of places worth waking up in.”</p><p className="mt-4 text-sm text-white/70">Travel Bug traveler journal</p></div>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link className="mb-12 flex items-center gap-2.5 font-bold text-slate-950 lg:hidden" href="/"><span className="grid size-10 place-items-center rounded-xl bg-teal-500"><Bug size={20} /></span><span className="text-xl">Travel Bug</span></Link>
          <p className="text-sm font-bold uppercase tracking-[.15em] text-teal-700">{mode === 'login' ? 'Welcome back' : 'Start exploring'}</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-950">{mode === 'login' ? 'Sign in to Travel Bug' : 'Create your account'}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{mode === 'login' ? 'Access saved stays, reviews, and hosting tools.' : 'Join travelers and hosts discovering remarkable places.'}</p>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            {mode === 'register' && <Field icon={User} label="Full name"><input className="w-full bg-transparent outline-none" name="name" placeholder="Alex Morgan" required minLength={2} /></Field>}
            <Field icon={Mail} label="Email address"><input autoComplete="email" className="w-full bg-transparent outline-none" name="email" placeholder="you@example.com" required type="email" /></Field>
            <Field icon={LockKeyhole} label="Password">
              <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="w-full bg-transparent outline-none" minLength={8} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required type={showPassword ? 'text' : 'password'} value={password} />
              <button aria-label={showPassword ? 'Hide password' : 'Show password'} className="text-slate-400" onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </Field>
            {mode === 'register' && <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">{requirements.map(([label, met]) => <span className={`flex items-center gap-1.5 text-xs ${met ? 'text-teal-700' : 'text-slate-400'}`} key={label}><Check size={13} /> {label}</span>)}</div>}
            {mode === 'login' && <div className="text-right"><Link className="text-sm font-semibold text-teal-700" href="/forgot-password">Forgot password?</Link></div>}
            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white transition hover:bg-teal-700 disabled:opacity-60" disabled={busy}>{busy && <LoaderCircle className="animate-spin" size={18} />}{mode === 'login' ? 'Sign in securely' : 'Create account'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">{mode === 'login' ? 'New to Travel Bug?' : 'Already have an account?'} <Link className="font-bold text-teal-700" href={mode === 'login' ? '/signup' : '/login'}>{mode === 'login' ? 'Create an account' : 'Sign in'}</Link></p>
        </div>
      </section>
    </main>
  )
}

function Field({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span><span className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3.5 text-sm focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10"><Icon className="shrink-0 text-slate-400" size={18} />{children}</span></label>
}
