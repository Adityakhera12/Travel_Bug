'use client'

import { Bath, BedDouble, CalendarDays, Check, ChevronLeft, Heart, LoaderCircle, MapPin, Share2, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { PropertyMap } from './PropertyMap'
import { PageShell } from './SiteChrome'
import type { PropertyView, ReviewView, UserView } from './types'

export function PropertyDetailExperience() {
  const id = useSearchParams().get('id')
  const [property, setProperty] = useState<PropertyView | null>(null)
  const [reviews, setReviews] = useState<ReviewView[]>([])
  const [user, setUser] = useState<UserView>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [rating, setRating] = useState(5)

  const loadReviews = async () => {
    if (!id) return
    const response = await fetch(`/api/reviews?property=${encodeURIComponent(id)}`)
    const data = await response.json()
    setReviews(data.reviews ?? [])
  }

  useEffect(() => {
    Promise.all([fetch('/api/properties').then((response) => response.json()), fetch('/api/app-auth').then((response) => response.json())])
      .then(([propertiesData, authData]) => {
        setProperty((propertiesData.properties ?? []).find((item: PropertyView) => item.id === id) ?? null)
        setUser(authData.user)
      })
      .finally(() => setLoading(false))
    void loadReviews()
  }, [id])

  const average = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : property?.rating ?? 0, [property, reviews])

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!id) return
    setBusy(true); setError(''); setNotice('')
    const data = new FormData(event.currentTarget)
    const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ property: id, rating, comment: data.get('comment') }) })
    const result = await response.json()
    setBusy(false)
    if (!response.ok) return setError(result.error)
    event.currentTarget.reset()
    setNotice('Thanks—your review is now live.')
    await loadReviews()
  }

  if (loading) return <PageShell><div className="mx-auto max-w-7xl px-5 py-20"><div className="h-[32rem] animate-pulse rounded-3xl bg-slate-200" /></div></PageShell>
  if (!property) return <PageShell><div className="mx-auto max-w-xl px-5 py-24 text-center"><MapPin className="mx-auto text-slate-300" size={42} /><h1 className="mt-5 font-serif text-4xl font-semibold">This stay wandered off.</h1><p className="mt-3 text-slate-500">The property may no longer be available.</p><Link className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white" href="/explore">Explore other stays</Link></div></PageShell>

  const gallery = property.images.length ? property.images : [{ url: property.image, alt: property.title }]
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-8 lg:px-8">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-teal-700" href="/explore"><ChevronLeft size={17} /> Back to explore</Link>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold capitalize text-teal-700">{property.propertyType}</p><h1 className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">{property.title}</h1><p className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500"><span className="flex items-center gap-1"><Star className="fill-teal-500 text-teal-500" size={16} /> <strong className="text-slate-800">{average ? average.toFixed(1) : 'New'}</strong> · {reviews.length || property.reviewCount} reviews</span><span className="flex items-center gap-1"><MapPin size={16} /> {property.address.city}, {property.address.region}</span></p></div>
          <div className="flex gap-2"><button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"><Share2 size={16} /> Share</button><button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"><Heart size={16} /> Save</button></div>
        </div>
        <div className="mt-7 grid h-[25rem] grid-cols-2 gap-2 overflow-hidden rounded-3xl md:grid-cols-4 md:grid-rows-2">
          <img alt={gallery[0]?.alt ?? property.title} className="col-span-2 row-span-2 h-full w-full object-cover" src={gallery[0]?.url} />
          {[1,2,3,4].map((index) => <div className="hidden overflow-hidden bg-slate-100 md:block" key={index}>{gallery[index] ? <img alt={gallery[index].alt} className="h-full w-full object-cover" src={gallery[index].url} /> : <img alt="" className="h-full w-full object-cover opacity-80" src={gallery[0]?.url} />}</div>)}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_23rem]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-7"><div><h2 className="text-2xl font-bold">Hosted with care</h2><p className="mt-2 text-slate-500">{property.maxGuests} guests · {property.bedrooms} bedrooms · {property.bathrooms} bathrooms</p></div><span className="grid size-14 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">TB</span></div>
            <div className="py-8"><h2 className="text-2xl font-bold">About this stay</h2><p className="mt-4 max-w-3xl whitespace-pre-line leading-8 text-slate-600">{property.description}</p></div>
            <div className="border-t border-slate-200 py-8"><h2 className="text-2xl font-bold">What this place offers</h2>{property.amenities.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{property.amenities.map((amenity) => <span className="flex items-center gap-3 capitalize text-slate-600" key={amenity}><span className="grid size-8 place-items-center rounded-full bg-teal-50 text-teal-700"><Check size={16} /></span>{amenity.replace('-', ' ')}</span>)}</div> : <p className="mt-3 text-slate-500">The host is adding amenity details soon.</p>}</div>
            <div className="border-t border-slate-200 py-8"><h2 className="text-2xl font-bold">Where you’ll be</h2><p className="mt-2 text-slate-500">{property.address.line1}, {property.address.city}, {property.address.region}</p><div className="mt-5 h-96 overflow-hidden rounded-3xl"><PropertyMap properties={[{ id: property.id, title: property.title, price: property.price, location: property.location }]} /></div></div>
          </div>
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 lg:sticky lg:top-28">
            <p className="text-2xl font-bold">${property.price.toLocaleString()} <span className="text-sm font-medium text-slate-500">/ night</span></p>
            <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200">
              <label className="border-b border-r border-slate-200 p-3 text-xs font-bold">CHECK-IN<input className="mt-1 w-full text-sm font-normal outline-none" type="date" /></label>
              <label className="border-b border-slate-200 p-3 text-xs font-bold">CHECKOUT<input className="mt-1 w-full text-sm font-normal outline-none" type="date" /></label>
              <label className="col-span-2 flex items-center gap-2 p-3 text-xs font-bold"><Users size={16} className="text-teal-700" />GUESTS<select className="ml-auto text-sm font-normal outline-none">{Array.from({ length: Math.min(property.maxGuests, 8) }, (_, index) => <option key={index + 1}>{index + 1} guest{index ? 's' : ''}</option>)}</select></label>
            </div>
            <button className="mt-4 w-full rounded-2xl bg-teal-600 px-5 py-4 font-bold text-white hover:bg-teal-700" onClick={() => setNotice('Inquiry saved. The host will confirm availability shortly.')}>Request to reserve</button>
            <p className="mt-3 text-center text-xs text-slate-500">You won’t be charged yet</p>
            {notice && <p className="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-800">{notice}</p>}
            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600"><p className="flex justify-between"><span>${property.price} × 3 nights</span><span>${property.price * 3}</span></p><p className="flex justify-between"><span>Service fee</span><span>$48</span></p><p className="flex justify-between border-t border-slate-100 pt-3 font-bold text-slate-950"><span>Total</span><span>${property.price * 3 + 48}</span></p></div>
          </aside>
        </div>

        <section className="border-t border-slate-200 pt-10">
          <div className="flex items-center gap-3"><Star className="fill-teal-500 text-teal-500" size={24} /><h2 className="text-2xl font-bold">{average ? average.toFixed(1) : 'New'} · {reviews.length || property.reviewCount} guest reviews</h2></div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">{reviews.length ? reviews.map((review) => <article className="rounded-3xl bg-slate-50 p-6" key={review.id}><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-slate-950 font-bold text-white">{review.author.name.charAt(0)}</span><div><p className="font-bold">{review.author.name}</p><p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p></div><span className="ml-auto flex items-center gap-1 text-sm font-bold"><Star className="fill-teal-500 text-teal-500" size={14} />{review.rating}</span></div><p className="mt-4 leading-7 text-slate-600">{review.comment}</p></article>) : <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center lg:col-span-2"><Star className="mx-auto text-slate-300" size={34} /><h3 className="mt-4 font-bold">No reviews yet</h3><p className="mt-2 text-sm text-slate-500">Be the first traveler to share what made this stay special.</p></div>}</div>
          <div className="mt-10 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h3 className="text-xl font-bold">Share your experience</h3>
            {user ? <form className="mt-5 space-y-4" onSubmit={submitReview}><div><p className="text-sm font-bold">Your rating</p><div className="mt-2 flex gap-1">{[1,2,3,4,5].map((value) => <button aria-label={`${value} stars`} className={value <= rating ? 'text-teal-500' : 'text-slate-200'} key={value} onClick={() => setRating(value)} type="button"><Star className="fill-current" size={28} /></button>)}</div></div><label className="block text-sm font-bold">Review<textarea className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-slate-200 p-4 font-normal outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" maxLength={600} minLength={10} name="comment" placeholder="What should future guests know?" required /></label>{error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<button className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white" disabled={busy}>{busy && <LoaderCircle className="animate-spin" size={17} />}Publish review</button></form> : <div className="mt-5 rounded-2xl bg-slate-50 p-5"><p className="font-bold">Sign in to write a review</p><p className="mt-1 text-sm text-slate-500">Authenticated reviews help keep the community trustworthy.</p><Link className="mt-4 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white" href={`/login?next=${encodeURIComponent(`/property?id=${property.id}`)}`}>Login to review</Link></div>}
          </div>
        </section>
      </section>
    </PageShell>
  )
}
