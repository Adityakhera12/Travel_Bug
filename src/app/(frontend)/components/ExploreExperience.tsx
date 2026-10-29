'use client'

import { ChevronDown, List, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { PropertyMap } from './PropertyMap'
import { PropertyCard } from './PropertyCard'
import { PageShell } from './SiteChrome'
import type { PropertyView } from './types'

const amenityOptions = ['wifi', 'pool', 'kitchen', 'parking', 'air-conditioning', 'workspace']

export function ExploreExperience({ initialMap = false }: { initialMap?: boolean }) {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<PropertyView[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [type, setType] = useState('all')
  const [maxPrice, setMaxPrice] = useState(1000)
  const [rating, setRating] = useState(0)
  const [amenities, setAmenities] = useState<string[]>([])
  const [sort, setSort] = useState('popular')
  const [view, setView] = useState<'list' | 'map'>(initialMap ? 'map' : 'list')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    void fetch('/api/properties')
      .then((response) => response.json())
      .then((data) => setProperties(data.properties ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const result = properties.filter((property) => {
      const haystack = `${property.title} ${property.address.city} ${property.address.region}`.toLowerCase()
      return (!term || haystack.includes(term)) &&
        (type === 'all' || property.propertyType === type) &&
        property.price <= maxPrice &&
        (property.rating ?? 0) >= rating &&
        amenities.every((amenity) => property.amenities.includes(amenity))
    })
    return [...result].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'rating' ? (b.rating ?? 0) - (a.rating ?? 0) : b.reviewCount - a.reviewCount)
  }, [amenities, maxPrice, properties, query, rating, sort, type])

  const toggleAmenity = (amenity: string) => setAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity])

  return (
    <PageShell>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[.15em] text-teal-700">Explore Travel Bug</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-950 sm:text-5xl">Find a stay that fits the story.</h1>
          <div className="mt-7 flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10">
            <Search className="text-teal-700" size={19} />
            <input className="w-full bg-transparent text-sm outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search destination, city, or property" value={query} />
            {query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={17} /></button>}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold lg:hidden" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17} /> Filters</button>
          <p className="text-sm text-slate-500"><strong className="text-slate-900">{filtered.length}</strong> stays found</p>
          <div className="flex items-center gap-2">
            <label className="relative">
              <select className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold outline-none" onChange={(event) => setSort(event.target.value)} value={sort}>
                <option value="popular">Most popular</option><option value="rating">Highest rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
              </select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-slate-400" size={16} />
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${view === 'list' ? 'bg-white shadow-sm' : 'text-slate-500'}`} onClick={() => setView('list')}><List size={16} /> <span className="hidden sm:inline">List</span></button>
              <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${view === 'map' ? 'bg-white shadow-sm' : 'text-slate-500'}`} onClick={() => setView('map')}><MapIcon size={16} /> <span className="hidden sm:inline">Map</span></button>
            </div>
          </div>
        </div>
        <div className="mt-7 grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} h-fit rounded-3xl border border-slate-200 bg-white p-5 lg:block`}>
            <FilterTitle title="Property type" />
            <select className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" onChange={(event) => setType(event.target.value)} value={type}><option value="all">All types</option><option value="apartment">Apartment</option><option value="house">House</option><option value="loft">Loft</option><option value="townhouse">Townhouse</option></select>
            <div className="my-6 h-px bg-slate-100" />
            <FilterTitle title="Maximum nightly price" />
            <input className="mt-4 w-full accent-teal-600" max="1000" min="50" onChange={(event) => setMaxPrice(Number(event.target.value))} step="25" type="range" value={maxPrice} />
            <div className="mt-2 flex justify-between text-xs text-slate-500"><span>$50</span><strong className="text-slate-900">${maxPrice}</strong></div>
            <div className="my-6 h-px bg-slate-100" />
            <FilterTitle title="Guest rating" />
            <div className="mt-3 grid grid-cols-3 gap-2">{[0, 4, 4.5].map((value) => <button className={`rounded-xl border px-2 py-2 text-xs font-bold ${rating === value ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200'}`} key={value} onClick={() => setRating(value)}>{value ? `${value}+` : 'Any'}</button>)}</div>
            <div className="my-6 h-px bg-slate-100" />
            <FilterTitle title="Amenities" />
            <div className="mt-3 space-y-3">{amenityOptions.map((amenity) => <label className="flex items-center gap-3 text-sm capitalize text-slate-600" key={amenity}><input checked={amenities.includes(amenity)} className="size-4 accent-teal-600" onChange={() => toggleAmenity(amenity)} type="checkbox" /> {amenity.replace('-', ' ')}</label>)}</div>
          </aside>
          <div>
            {view === 'map' ? (
              <div className="sticky top-28 h-[44rem] overflow-hidden rounded-3xl border border-slate-200 bg-white"><PropertyMap properties={filtered.map(({ id, title, price, location }) => ({ id, title, price, location }))} /></div>
            ) : loading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map((item) => <div className="h-96 animate-pulse rounded-3xl bg-slate-200" key={item} />)}</div>
            ) : filtered.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map((property) => <PropertyCard key={property.id} property={property} />)}</div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center"><Search className="mx-auto text-slate-300" size={40} /><h2 className="mt-5 text-xl font-bold">No stays match these filters</h2><p className="mt-2 text-slate-500">Try widening your price range or clearing a few amenities.</p><button className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white" onClick={() => { setType('all'); setAmenities([]); setRating(0); setMaxPrice(1000) }}>Reset filters</button></div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function FilterTitle({ title }: { title: string }) {
  return <h2 className="text-sm font-bold text-slate-950">{title}</h2>
}
