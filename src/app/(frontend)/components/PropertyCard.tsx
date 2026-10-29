import { Heart, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import type { PropertyView } from './types'

export function PropertyCard({ property }: { property: PropertyView }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {property.image ? (
          <img alt={property.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={property.image} />
        ) : (
          <div className="grid h-full place-items-center bg-slate-100 text-sm text-slate-400">Photo coming soon</div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold capitalize text-slate-800 backdrop-blur">{property.propertyType}</span>
        <button aria-label="Save stay" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-slate-700 backdrop-blur transition hover:text-teal-700"><Heart size={18} /></button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-950">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} /> {property.address.city}, {property.address.region}</p>
          </div>
          <span className="flex items-center gap-1 text-sm font-bold"><Star className="fill-teal-500 text-teal-500" size={15} /> {property.rating?.toFixed(1) ?? 'New'}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{property.description}</p>
        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <p className="text-lg font-bold text-slate-950">${property.price.toLocaleString()} <span className="text-xs font-medium text-slate-500">/ night</span></p>
          <Link className="text-sm font-bold text-teal-700 hover:text-teal-800" href={`/property?id=${property.id}`}>View stay</Link>
        </div>
      </div>
    </article>
  )
}
