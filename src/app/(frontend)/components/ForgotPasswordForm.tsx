'use client'

import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent) => { event.preventDefault(); setSent(true) }
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"><Link className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-700" href="/login"><ArrowLeft size={16} /> Back to login</Link>{sent ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto text-teal-600" size={48} /><h1 className="mt-5 font-serif text-4xl font-semibold">Check your inbox</h1><p className="mt-3 text-sm leading-6 text-slate-500">If an account exists for that email, password recovery instructions will be sent by the configured email provider.</p></div> : <><p className="mt-10 text-sm font-bold uppercase tracking-[.15em] text-teal-700">Account recovery</p><h1 className="mt-2 font-serif text-4xl font-semibold">Forgot your password?</h1><p className="mt-3 text-sm leading-6 text-slate-500">Enter the email associated with your Travel Bug account.</p><form className="mt-7" onSubmit={submit}><label className="text-sm font-bold text-slate-700">Email address<span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3.5 focus-within:border-teal-500"><Mail className="text-slate-400" size={18} /><input className="w-full text-sm outline-none" placeholder="you@example.com" required type="email" /></span></label><button className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white">Send recovery link</button></form></>}</div></main>
}
