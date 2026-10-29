'use client'

import {
  Bath,
  BedDouble,
  Bug,
  ChevronDown,
  Compass,
  Heart,
  List,
  LoaderCircle,
  LocateFixed,
  LogOut,
  Map as MapIcon,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { PropertyMap } from './PropertyMap'

export type PropertyView = {
  id: string
  title: string
  description: string
  propertyType: string
  price: number
  bedrooms: number
  bathrooms: number
  address: { line1: string; city: string; region: string }
  location: [number, number]
  image: string
  reviewCount: number
  rating: number | null
}

type UserView = { id: string; name: string; email: string } | null
type Dialog = 'auth' | 'property' | 'review' | null

const inputClass =
  'w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'

export function Marketplace({
  properties: initialProperties,
  initialUser,
}: {
  properties: PropertyView[]
  initialUser: UserView
}) {
  const router = useRouter()
  const [properties, setProperties] = useState(initialProperties)
  const [user, setUser] = useState(initialUser)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'map'>('list')
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadProperties = async () => {
    const response = await fetch('/api/properties')
    if (response.ok) {
      const result = await response.json()
      setProperties(result.properties)
    }
  }

  useEffect(() => {
    void loadProperties()
    void fetch('/api/app-auth')
      .then((response) => response.json())
      .then((result) => setUser(result.user))
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return properties.filter((property) => {
      const matchesType = type === 'all' || property.propertyType === type
      const matchesQuery =
        !term ||
        `${property.title} ${property.address.city} ${property.address.region}`
          .toLowerCase()
          .includes(term)
      return matchesType && matchesQuery
    })
  }, [properties, query, type])

  const openProtected = (next: Exclude<Dialog, 'auth' | null>, propertyId?: string) => {
    setError('')
    if (!user) {
      setAuthMode('login')
      setDialog('auth')
      return
    }
    setSelectedId(propertyId ?? null)
    setDialog(next)
  }

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/app-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: authMode,
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      }),
    })
    const result = await response.json()
    setBusy(false)
    if (!response.ok) return setError(result.error)
    setUser(result.user)
    setDialog(null)
    router.refresh()
  }

  const logout = async () => {
    await fetch('/api/app-auth', { method: 'DELETE' })
    setUser(null)
    router.refresh()
  }

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedId) return
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property: selectedId,
        rating: Number(form.get('rating')),
        comment: form.get('comment'),
      }),
    })
    const result = await response.json()
    setBusy(false)
    if (!response.ok) return setError(result.error)
    setDialog(null)
    await loadProperties()
  }

  const submitProperty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const image = form.get('image')

    try {
      if (!(image instanceof File) || image.size === 0) throw new Error('Add a property image.')
      const uploadData = new FormData()
      uploadData.set('file', image)
      const uploadResponse = await fetch('/api/uploads', { method: 'POST', body: uploadData })
      const uploaded = await uploadResponse.json()
      if (!uploadResponse.ok) throw new Error(uploaded.error)

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          description: form.get('description'),
          propertyType: form.get('propertyType'),
          price: Number(form.get('price')),
          bedrooms: Number(form.get('bedrooms')),
          bathrooms: Number(form.get('bathrooms')),
          address: {
            line1: form.get('line1'),
            city: form.get('city'),
            region: form.get('region'),
          },
          location: [Number(form.get('longitude')), Number(form.get('latitude'))],
          images: [{ url: uploaded.url, publicId: uploaded.publicId, alt: form.get('title') }],
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setDialog(null)
      await loadProperties()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to add the property.')
    } finally {
      setBusy(false)
    }
  }

  const useLocation = () => {
    setError('')
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        const latitude = document.querySelector<HTMLInputElement>('[name="latitude"]')
        const longitude = document.querySelector<HTMLInputElement>('[name="longitude"]')
        if (latitude) latitude.value = coords.latitude.toFixed(6)
        if (longitude) longitude.value = coords.longitude.toFixed(6)
      },
      () => setError('Location permission was unavailable. Enter coordinates manually.'),
    )
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#fffaf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a className="flex items-center gap-2.5 font-semibold tracking-tight" href="#">
            <span className="grid size-9 place-items-center rounded-xl bg-rose-600 text-white shadow-sm shadow-rose-600/20">
              <Bug size={18} strokeWidth={2.4} />
            </span>
            <span className="text-xl">Travel-Bug</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-stone-600 md:flex">
            <a className="font-medium text-stone-950" href="#homes">Explore stays</a>
            <a className="transition hover:text-stone-950" href="#map">Explore map</a>
            <a className="transition hover:text-stone-950" href="#trust">Why Travel-Bug</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              className="hidden items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:border-stone-300 sm:flex"
              onClick={() => openProtected('property')}
            >
              <Plus size={16} /> Become a host
            </button>
            {user ? (
              <button
                className="flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
                onClick={logout}
                title={`Signed in as ${user.name}`}
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : (
              <button
                className="rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
                onClick={() => setDialog('auth')}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-14 pt-10 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:pb-20 lg:pt-14">
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-rose-600/15 bg-rose-600/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-rose-700">
            <Sparkles size={14} /> Stay curious. Travel beautifully.
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[.98] tracking-[-.05em] sm:text-6xl lg:text-7xl">
            Find a stay worth <span className="font-serif font-normal italic text-rose-600">remembering.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
            From hidden city lofts to sun-soaked coastal homes, discover places shaped by the travelers who found them first.
          </p>
          <div className="mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_20px_60px_-32px_rgba(28,25,23,.3)] sm:flex-row">
            <label className="flex flex-1 items-center gap-3 px-3">
              <Search className="text-stone-400" size={19} />
              <input
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-stone-400"
                placeholder="Where do you want to go?"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button
              className="rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              onClick={() => document.querySelector('#homes')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore stays
            </button>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-stone-500">
            <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-rose-600" /> Verified hosts</span>
            <span className="flex items-center gap-2"><Compass size={17} className="text-rose-600" /> Map-first discovery</span>
          </div>
        </div>
        <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] bg-stone-200">
          <img
            src="https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1400&q=85"
            alt="White Mediterranean vacation home surrounded by trees"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/70 to-transparent p-7 pt-24 text-white">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/70">The Mediterranean edit</p>
            <p className="mt-2 text-2xl font-medium">Salt air, slow mornings, no agenda.</p>
          </div>
        </div>
      </section>

      <section id="homes" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-rose-600">WANDER THIS WAY</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Stays travelers keep talking about</h2>
              <p className="mt-3 text-stone-500">{filtered.length} {filtered.length === 1 ? 'stay' : 'stays'} to explore</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative">
                <select
                  className="appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium outline-none"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option value="all">All property types</option>
                  <option value="apartment">Apartments</option>
                  <option value="house">Houses</option>
                  <option value="loft">Lofts</option>
                  <option value="townhouse">Townhouses</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 text-stone-400" size={16} />
              </label>
              <div className="flex rounded-xl bg-stone-100 p-1">
                <button
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${view === 'list' ? 'bg-white shadow-sm' : 'text-stone-500'}`}
                  onClick={() => setView('list')}
                ><List size={16} /> List</button>
                <button
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${view === 'map' ? 'bg-white shadow-sm' : 'text-stone-500'}`}
                  onClick={() => setView('map')}
                ><MapIcon size={16} /> Map</button>
              </div>
            </div>
          </div>

          {view === 'map' ? (
            <div id="map" className="mt-9 overflow-hidden rounded-3xl border border-stone-200">
              <PropertyMap properties={filtered.map(({ id, title, price, location }) => ({ id, title, price, location }))} />
            </div>
          ) : filtered.length ? (
            <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((property) => (
                <article key={property.id} className="group overflow-hidden rounded-3xl border border-stone-200 bg-[#fbfaf7] transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/5">
                  <div className="relative h-64 overflow-hidden bg-stone-100">
                    <img className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" src={property.image} alt={property.title} />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold capitalize backdrop-blur">{property.propertyType}</span>
                    <button className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/90 text-stone-700 backdrop-blur transition hover:text-rose-600" aria-label="Save property"><Heart size={17} /></button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{property.title}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500"><MapPin size={14} /> {property.address.city}, {property.address.region}</p>
                      </div>
                      <p className="whitespace-nowrap font-semibold">${property.price.toLocaleString()}<span className="text-xs font-normal text-stone-400"> / night</span></p>
                    </div>
                    <div className="mt-5 flex items-center gap-5 border-t border-stone-200 pt-4 text-sm text-stone-600">
                      <span className="flex items-center gap-2"><BedDouble size={17} /> {property.bedrooms} bed</span>
                      <span className="flex items-center gap-2"><Bath size={17} /> {property.bathrooms} bath</span>
                    </div>
                    <button
                      className="mt-4 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-medium ring-1 ring-stone-200 transition hover:ring-rose-500"
                      onClick={() => openProtected('review', property.id)}
                    >
                      <span className="flex items-center gap-2">
                        <Star size={16} className="fill-amber-400 text-amber-400" />
                        {property.rating ? `${property.rating.toFixed(1)} · ${property.reviewCount} reviews` : 'Be the first to review'}
                      </span>
                      <span>Review</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-9 rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-20 text-center">
              <Bug className="mx-auto text-stone-300" size={40} />
              <h3 className="mt-5 text-xl font-semibold">Your next story starts here</h3>
              <p className="mx-auto mt-2 max-w-md text-stone-500">No stays match this search yet. Try another destination or share the first hidden gem.</p>
              <button className="mt-6 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white" onClick={() => openProtected('property')}>List your place</button>
            </div>
          )}
        </div>
      </section>

      <section id="trust" className="bg-stone-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-3 lg:px-8 lg:py-20">
          {[
            [ShieldCheck, 'Travel with confidence', 'Protected accounts, verified hosts, and server-side validation at every step.'],
            [MapPin, 'Know before you go', 'Interactive maps put every stay and neighborhood into perspective.'],
            [Star, 'Stories you can trust', 'Signed-in travelers share honest, accountable reviews after the journey.'],
          ].map(([Icon, title, copy]) => {
            const FeatureIcon = Icon as typeof ShieldCheck
            return (
              <div key={String(title)} className="border-l border-white/15 pl-6">
                <FeatureIcon className="text-rose-300" size={24} />
                <h3 className="mt-5 text-xl font-semibold">{String(title)}</h3>
                <p className="mt-2 leading-7 text-stone-300">{String(copy)}</p>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="bg-[#fffaf7]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span className="flex items-center gap-2 font-semibold text-stone-800"><Bug size={17} /> Travel-Bug</span>
          <span>Go farther. Stay better.</span>
        </div>
      </footer>

      {dialog && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setDialog(null)}>
          <div className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-rose-600">
                  {dialog === 'auth' ? 'Welcome to Travel-Bug' : dialog === 'property' ? 'Host a stay' : 'Your travel story'}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {dialog === 'auth' ? (authMode === 'login' ? 'Sign in' : 'Create your account') : dialog === 'property' ? 'List your place' : 'Write a review'}
                </h2>
              </div>
              <button className="grid size-9 place-items-center rounded-full bg-stone-100 text-stone-500 hover:text-stone-900" onClick={() => setDialog(null)} aria-label="Close"><X size={18} /></button>
            </div>

            {dialog === 'auth' && (
              <form className="mt-6 space-y-4" onSubmit={submitAuth}>
                {authMode === 'register' && <input className={inputClass} name="name" placeholder="Full name" minLength={2} maxLength={80} required />}
                <input className={inputClass} name="email" type="email" placeholder="Email address" required />
                <input className={inputClass} name="password" type="password" placeholder="Password (8+ characters)" minLength={8} maxLength={72} required />
                {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
                <SubmitButton busy={busy}>{authMode === 'login' ? 'Sign in securely' : 'Create account'}</SubmitButton>
                <button type="button" className="w-full text-sm text-stone-500 hover:text-stone-900" onClick={() => { setError(''); setAuthMode(authMode === 'login' ? 'register' : 'login') }}>
                  {authMode === 'login' ? 'New to Travel-Bug? Create an account' : 'Already have an account? Sign in'}
                </button>
              </form>
            )}

            {dialog === 'review' && (
              <form className="mt-6 space-y-4" onSubmit={submitReview}>
                <label className="block text-sm font-medium">Rating
                  <select className={`${inputClass} mt-2`} name="rating" defaultValue="5">
                    <option value="5">5 — Exceptional</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">Review
                  <textarea className={`${inputClass} mt-2 min-h-32 resize-y`} name="comment" placeholder="What should the next traveler know?" minLength={10} maxLength={600} required />
                </label>
                {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
                <SubmitButton busy={busy}>Publish review</SubmitButton>
              </form>
            )}

            {dialog === 'property' && (
              <form className="mt-6 space-y-4" onSubmit={submitProperty}>
                <input className={inputClass} name="title" placeholder="Property title" minLength={4} maxLength={100} required />
                <textarea className={`${inputClass} min-h-28 resize-y`} name="description" placeholder="Describe the home, building, and neighborhood" minLength={30} maxLength={1200} required />
                <div className="grid grid-cols-2 gap-3">
                  <select className={inputClass} name="propertyType" defaultValue="apartment"><option value="apartment">Apartment</option><option value="house">House</option><option value="loft">Loft</option><option value="townhouse">Townhouse</option></select>
                  <input className={inputClass} name="price" type="number" min="1" max="1000000" placeholder="Price per night" required />
                  <input className={inputClass} name="bedrooms" type="number" min="0" max="20" placeholder="Bedrooms" required />
                  <input className={inputClass} name="bathrooms" type="number" min="1" max="20" placeholder="Bathrooms" required />
                </div>
                <input className={inputClass} name="line1" placeholder="Street address" required />
                <div className="grid grid-cols-2 gap-3"><input className={inputClass} name="city" placeholder="City" required /><input className={inputClass} name="region" placeholder="State / region" required /></div>
                <div className="grid grid-cols-2 gap-3"><input className={inputClass} name="latitude" type="number" step="any" min="-90" max="90" placeholder="Latitude" required /><input className={inputClass} name="longitude" type="number" step="any" min="-180" max="180" placeholder="Longitude" required /></div>
                <button className="flex items-center gap-2 text-sm font-medium text-rose-600" type="button" onClick={useLocation}><LocateFixed size={16} /> Use my current location</button>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600 transition hover:border-rose-500">
                  <span className="grid size-10 place-items-center rounded-xl bg-white shadow-sm"><Upload size={18} /></span>
                  <span><strong className="block text-stone-900">Upload a cover image</strong>JPG, PNG, or WebP up to 8 MB</span>
                  <input className="sr-only" name="image" type="file" accept="image/jpeg,image/png,image/webp" required />
                </label>
                {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
                <SubmitButton busy={busy}>Publish stay</SubmitButton>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} type="submit">
      {busy && <LoaderCircle className="animate-spin" size={17} />} {children}
    </button>
  )
}
