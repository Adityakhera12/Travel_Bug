'use client'

import { ArrowRight, CalendarDays, MapPin, Search, ShieldCheck, Sparkles, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { PropertyCard } from './PropertyCard'
import { SiteFooter, SiteHeader } from './SiteChrome'
import type { PropertyView } from './types'

const destinations = [
  { name: 'Amalfi Coast', stays: '148 stays', image: 'https://images.unsplash.com/photo-1631692994944-f90b09f60953?auto=format&fit=crop&w=900&q=85' },
  { name: 'Lake Como', stays: '92 stays', image: 'https://images.unsplash.com/photo-1653927550934-3a0c19549a18?auto=format&fit=crop&w=900&q=85' },
  { name: 'Cape Town', stays: '216 stays', image: 'https://images.unsplash.com/photo-1779709285873-4f87fe7d9f77?auto=format&fit=crop&w=900&q=85' },
  { name: 'Kotor Bay', stays: '74 stays', image: 'https://images.unsplash.com/photo-1771589239746-48b32dfbe873?auto=format&fit=crop&w=900&q=85' },
]

export function HomeExperience() {
  const [properties, setProperties] = useState<PropertyView[]>([])
  const [destination, setDestination] = useState('')

  useEffect(() => {
    void fetch('/api/properties').then((response) => response.json()).then((data) => setProperties(data.properties ?? []))
  }, [])

  const search = (event: FormEvent) => {
    event.preventDefault()
    window.location.href = `/explore?q=${encodeURIComponent(destination)}`
  }

  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="relative min-h-[46rem] overflow-hidden bg-slate-950">
        <img alt="Aerial view of a beautiful coastal city beside clear blue water" className="absolute inset-0 h-full w-full object-cover opacity-70" src="https://images.unsplash.com/photo-1596191796282-b1c7682de3fa?auto=format&fit=crop&w=2200&q=90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-slate-950/20" />
        <SiteHeader transparent />
        <div className="relative mx-auto flex min-h-[40rem] max-w-7xl items-center px-5 pb-20 pt-32 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] backdrop-blur"><Sparkles size={15} className="text-teal-300" /> Curated stays, unforgettable places</div>
            <h1 className="font-serif text-5xl font-semibold leading-[.95] tracking-tight sm:text-7xl lg:text-8xl">Discover Your Next Adventure.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">Find unique stays and unforgettable destinations around the world.</p>
            <form className="mt-10 grid overflow-hidden rounded-3xl bg-white p-2 text-slate-950 shadow-2xl md:grid-cols-[1.5fr_1fr_1fr_.8fr_auto]" onSubmit={search}>
              <SearchField icon={MapPin} label="Destination"><input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" onChange={(event) => setDestination(event.target.value)} placeholder="Where are you going?" value={destination} /></SearchField>
              <SearchField icon={CalendarDays} label="Check in"><input className="w-full bg-transparent text-sm outline-none" type="date" /></SearchField>
              <SearchField icon={CalendarDays} label="Check out"><input className="w-full bg-transparent text-sm outline-none" type="date" /></SearchField>
              <SearchField icon={Users} label="Guests"><select className="w-full bg-transparent text-sm outline-none"><option>2 guests</option><option>3 guests</option><option>4 guests</option><option>5+ guests</option></select></SearchField>
              <button className="m-1 flex items-center justify-center gap-2 rounded-2xl bg-teal-500 px-6 py-4 font-bold text-slate-950 transition hover:bg-teal-400"><Search size={18} /> Search</button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Explore the world" title="Trending destinations" copy="Places our travelers cannot stop talking about." link="/explore" />
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination) => (
            <Link className="group relative aspect-[4/5] overflow-hidden rounded-3xl" href={`/explore?q=${encodeURIComponent(destination.name)}`} key={destination.name}>
              <img alt={destination.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={destination.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white"><h3 className="text-xl font-bold">{destination.name}</h3><p className="mt-1 text-sm text-white/70">{destination.stays}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading eyebrow="Traveler favorites" title="Top-rated stays" copy="Beautiful places backed by genuine guest experiences." link="/explore" />
          {properties.length ? (
            <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{properties.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} />)}</div>
          ) : (
            <div className="mt-9 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center"><p className="font-bold">Fresh stays are on the way.</p><p className="mt-2 text-sm text-slate-500">Be the first host to share a remarkable place.</p><Link className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white" href="/add-property">List your place</Link></div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-20 lg:grid-cols-3 lg:px-8">
        {[
          [ShieldCheck, 'Book with confidence', 'Secure accounts, validated listings, and accountable traveler reviews.'],
          [MapPin, 'Explore every angle', 'Map-first discovery helps you understand the place before you arrive.'],
          [Star, 'Stay somewhere special', 'Thoughtful homes selected for comfort, character, and location.'],
        ].map(([Icon, title, copy]) => {
          const FeatureIcon = Icon as typeof ShieldCheck
          return <div className="rounded-3xl border border-slate-200 bg-white p-7" key={String(title)}><span className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><FeatureIcon size={23} /></span><h3 className="mt-5 text-xl font-bold">{String(title)}</h3><p className="mt-2 leading-7 text-slate-500">{String(copy)}</p></div>
        })}
      </section>

      <section className="bg-teal-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
          <div><p className="text-sm font-bold uppercase tracking-[.16em] text-teal-300">Guest stories</p><h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">The best trips stay with you.</h2><p className="mt-5 leading-7 text-teal-100/70">Real notes from travelers who found somewhere worth returning to.</p><Link className="mt-7 inline-flex items-center gap-2 font-bold text-teal-300" href="/reviews">Read guest reviews <ArrowRight size={17} /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['“The map view made choosing the right neighborhood effortless. The stay was even better than the photos.”', 'Maya R. · Toronto'],
              ['“Everything felt clear, trustworthy, and beautifully considered from search to check-in.”', 'Daniel K. · Berlin'],
            ].map(([quote, author]) => <blockquote className="rounded-3xl bg-white/10 p-7" key={author}><div className="flex gap-1 text-teal-300">{[1,2,3,4,5].map((star) => <Star className="fill-current" key={star} size={15} />)}</div><p className="mt-5 text-lg leading-8">{quote}</p><footer className="mt-5 text-sm font-bold text-teal-200">{author}</footer></blockquote>)}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}

function SearchField({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return <label className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r"><Icon className="shrink-0 text-teal-700" size={18} /><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-500">{label}</span>{children}</span></label>
}

function SectionHeading({ eyebrow, title, copy, link }: { eyebrow: string; title: string; copy: string; link: string }) {
  return <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[.15em] text-teal-700">{eyebrow}</p><h2 className="mt-2 font-serif text-4xl font-semibold text-slate-950">{title}</h2><p className="mt-3 text-slate-500">{copy}</p></div><Link className="flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-teal-700" href={link}>View all <ArrowRight size={16} /></Link></div>
}
