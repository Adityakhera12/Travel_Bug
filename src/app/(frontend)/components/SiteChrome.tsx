'use client'

import { Bug, LogOut, Menu, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { UserView } from './types'

const links = [
  ['Home', '/'],
  ['Explore stays', '/explore'],
  ['Maps', '/map'],
  ['About', '/about'],
] as const

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link className={`flex items-center gap-2.5 font-bold tracking-tight ${light ? 'text-white' : 'text-slate-950'}`} href="/">
      <span className="grid size-10 place-items-center rounded-xl bg-teal-500 text-slate-950">
        <Bug size={20} strokeWidth={2.5} />
      </span>
      <span className="text-xl">Travel Bug</span>
    </Link>
  )
}

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<UserView>(null)

  useEffect(() => {
    void fetch('/api/app-auth')
      .then((response) => response.json())
      .then((result) => setUser(result.user))
  }, [])

  const logout = async () => {
    await fetch('/api/app-auth', { method: 'DELETE' })
    setUser(null)
    window.location.href = '/'
  }

  const surface = transparent
    ? 'absolute inset-x-0 top-0 z-40 border-white/10 bg-slate-950/20 text-white backdrop-blur-md'
    : 'sticky top-0 z-40 border-slate-200 bg-white/95 text-slate-950 backdrop-blur-md'

  return (
    <header className={`border-b ${surface}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo light={transparent} />
        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          {links.map(([label, href]) => (
            <Link className={transparent ? 'text-white/80 transition hover:text-white' : 'text-slate-600 transition hover:text-teal-700'} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Link className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`} href="/add-property">
            <span className="flex items-center gap-2"><Plus size={16} /> List your place</span>
          </Link>
          {user ? (
            <button className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${transparent ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'}`} onClick={logout} title={`Signed in as ${user.name}`}>
              <span className="flex items-center gap-2"><LogOut size={16} /> Sign out</span>
            </button>
          ) : (
            <>
              <Link className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${transparent ? 'text-white' : 'text-slate-700'}`} href="/login">Login</Link>
              <Link className="rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-teal-400" href="/signup">Sign up</Link>
            </>
          )}
        </div>
        <button aria-label="Open menu" className={`grid size-10 place-items-center rounded-xl sm:hidden ${transparent ? 'bg-white/10 text-white' : 'bg-slate-100'}`} onClick={() => setMenuOpen(true)}>
          <Menu size={20} />
        </button>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 p-5 text-white sm:hidden">
          <div className="flex items-center justify-between">
            <Logo light />
            <button aria-label="Close menu" className="grid size-10 place-items-center rounded-xl bg-white/10" onClick={() => setMenuOpen(false)}><X size={20} /></button>
          </div>
          <nav className="mt-12 flex flex-col gap-2">
            {links.map(([label, href]) => <Link className="rounded-2xl px-4 py-4 text-xl font-semibold hover:bg-white/10" href={href} key={href}>{label}</Link>)}
            <Link className="mt-4 rounded-2xl bg-teal-500 px-4 py-4 text-center font-bold text-slate-950" href={user ? '/add-property' : '/login'}>{user ? 'List your place' : 'Login'}</Link>
            {!user && <Link className="rounded-2xl border border-white/20 px-4 py-4 text-center font-bold" href="/signup">Create account</Link>}
          </nav>
        </div>
      )}
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">Thoughtfully selected stays, useful local context, and trusted traveler reviews for wherever you go next.</p>
          <p className="mt-5 text-sm text-slate-300">hello@travelbug.example</p>
        </div>
        {[
          ['Discover', ['Explore stays', 'Map view', 'Top rated']],
          ['Hosting', ['List your place', 'Host resources', 'Community']],
          ['Company', ['About us', 'Safety', 'Contact']],
        ].map(([title, items]) => (
          <div key={String(title)}>
            <p className="font-bold">{String(title)}</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              {(items as string[]).map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between lg:px-8">
          <span>© 2026 Travel Bug. All rights reserved.</span>
          <span>Privacy · Terms · Accessibility</span>
        </div>
      </div>
    </footer>
  )
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <><SiteHeader /><main>{children}</main><SiteFooter /></>
}
