'use client'

import { MessageSquareText, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageShell } from './SiteChrome'
import type { ReviewView } from './types'

export function ReviewsExperience() {
  const [reviews, setReviews] = useState<ReviewView[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { void fetch('/api/reviews').then((response) => response.json()).then((data) => setReviews(data.reviews ?? [])).finally(() => setLoading(false)) }, [])
  const average = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, [reviews])
  return (
    <PageShell>
      <section className="bg-teal-950 text-white"><div className="mx-auto max-w-7xl px-5 py-16 text-center lg:px-8"><p className="text-sm font-bold uppercase tracking-[.15em] text-teal-300">Travel Bug community</p><h1 className="mt-3 font-serif text-5xl font-semibold">Guest stories, honestly told.</h1><p className="mx-auto mt-4 max-w-2xl text-teal-100/70">Authenticated travelers sharing the details that make a stay worth remembering.</p>{reviews.length > 0 && <div className="mt-7 flex items-center justify-center gap-3"><span className="text-3xl font-bold">{average.toFixed(1)}</span><span className="flex text-teal-300">{[1,2,3,4,5].map((star) => <Star className="fill-current" key={star} size={18} />)}</span><span className="text-sm text-teal-100/60">{reviews.length} reviews</span></div>}</div></section>
      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        {loading ? <div className="grid gap-5 md:grid-cols-2">{[1,2,3,4].map((item) => <div className="h-52 animate-pulse rounded-3xl bg-slate-200" key={item} />)}</div> : reviews.length ? <div className="grid gap-5 md:grid-cols-2">{reviews.map((review) => <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" key={review.id}><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-slate-950 font-bold text-white">{review.author.name.charAt(0)}</span><div><h2 className="font-bold">{review.author.name}</h2><p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p></div><span className="ml-auto flex items-center gap-1 font-bold"><Star className="fill-teal-500 text-teal-500" size={15} />{review.rating}</span></div><p className="mt-5 leading-7 text-slate-600">{review.comment}</p></article>)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 py-20 text-center"><MessageSquareText className="mx-auto text-slate-300" size={42} /><h2 className="mt-5 text-xl font-bold">The guest book is ready</h2><p className="mt-2 text-slate-500">Reviews will appear here as travelers share their experiences.</p></div>}
      </section>
    </PageShell>
  )
}
