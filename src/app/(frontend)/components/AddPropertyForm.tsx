'use client'

import { CheckCircle2, ImagePlus, LoaderCircle, LocateFixed, MapPin, UploadCloud, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ChangeEvent, DragEvent, FormEvent, useEffect, useState } from 'react'
import { LocationPicker } from './LocationPicker'
import { PageShell } from './SiteChrome'

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'
const amenities = ['wifi', 'pool', 'kitchen', 'parking', 'air-conditioning', 'workspace']

export function AddPropertyForm() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [location, setLocation] = useState<[number, number]>([-73.9857, 40.7484])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    void fetch('/api/app-auth').then((response) => response.json()).then((data) => setIsSignedIn(Boolean(data.user)))
  }, [])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(URL.revokeObjectURL)
  }, [files])

  const addFiles = (incoming: File[]) => {
    setError('')
    const images = incoming.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    setFiles((current) => [...current, ...images].slice(0, 8))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!files.length) return setError('Add at least one property photo.')
    setBusy(true)
    const form = new FormData(event.currentTarget)
    try {
      const uploaded = []
      for (const file of files) {
        const upload = new FormData()
        upload.set('file', file)
        const response = await fetch('/api/uploads', { method: 'POST', body: upload })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        uploaded.push({ url: result.url, publicId: result.publicId, alt: String(form.get('title')) })
      }
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'), description: form.get('description'), propertyType: form.get('propertyType'),
          price: Number(form.get('price')), bedrooms: Number(form.get('bedrooms')), bathrooms: Number(form.get('bathrooms')),
          maxGuests: Number(form.get('maxGuests')), amenities: form.getAll('amenities'),
          address: { line1: form.get('line1'), city: form.get('city'), region: form.get('region') },
          location, images: uploaded,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setSuccess(true)
      setTimeout(() => router.push(`/property?id=${result.property.id}`), 900)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to publish your property.')
    } finally {
      setBusy(false)
    }
  }

  const useCurrentLocation = () => navigator.geolocation?.getCurrentPosition(({ coords }) => setLocation([Number(coords.longitude.toFixed(6)), Number(coords.latitude.toFixed(6))]), () => setError('Location permission was unavailable. Drag the marker or enter coordinates.'))

  if (isSignedIn === false) return <PageShell><section className="mx-auto max-w-xl px-5 py-24 text-center"><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-teal-50 text-teal-700"><UploadCloud size={28} /></span><h1 className="mt-6 font-serif text-4xl font-semibold">Ready to host?</h1><p className="mt-3 text-slate-500">Sign in to list a property, upload photos, and manage your stay securely.</p><button className="mt-7 rounded-2xl bg-slate-950 px-6 py-3.5 font-bold text-white" onClick={() => router.push('/login')}>Sign in to continue</button></section></PageShell>

  return (
    <PageShell>
      <section className="bg-slate-950 text-white"><div className="mx-auto max-w-5xl px-5 py-14 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.15em] text-teal-300">Host on Travel Bug</p><h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Share a place travelers will remember.</h1><p className="mt-4 max-w-2xl text-slate-300">Create a polished listing with clear details, beautiful imagery, and an accurate map location.</p></div></section>
      <form className="mx-auto max-w-5xl space-y-6 px-5 py-10 lg:px-8" onSubmit={submit}>
        <FormSection number="01" title="Tell us about your place" copy="Give travelers a clear, inviting first impression.">
          <Field label="Property title"><input className={inputClass} name="title" placeholder="Oceanview villa with a private pool" minLength={4} maxLength={100} required /></Field>
          <Field label="Description"><textarea className={`${inputClass} min-h-36 resize-y`} name="description" placeholder="Describe what makes the stay and neighborhood special..." minLength={30} maxLength={1200} required /></Field>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Category"><select className={inputClass} name="propertyType"><option value="apartment">Apartment</option><option value="house">House</option><option value="loft">Loft</option><option value="townhouse">Townhouse</option></select></Field>
            <Field label="Price / night"><input className={inputClass} min="1" name="price" placeholder="$240" required type="number" /></Field>
            <Field label="Bedrooms"><input className={inputClass} min="0" max="20" name="bedrooms" required type="number" /></Field>
            <Field label="Bathrooms"><input className={inputClass} min="1" max="20" name="bathrooms" required type="number" /></Field>
          </div>
          <Field label="Maximum guests"><input className={inputClass} min="1" max="40" name="maxGuests" placeholder="4" required type="number" /></Field>
          <div><p className="text-sm font-bold text-slate-700">Amenities</p><div className="mt-3 flex flex-wrap gap-2">{amenities.map((amenity) => <label className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm capitalize has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800" key={amenity}><input className="sr-only" name="amenities" type="checkbox" value={amenity} />{amenity.replace('-', ' ')}</label>)}</div></div>
        </FormSection>
        <FormSection number="02" title="Add beautiful photos" copy="Upload up to eight JPG, PNG, or WebP images. Each can be up to 8 MB.">
          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-teal-500 hover:bg-teal-50/50" onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); addFiles(Array.from(event.dataTransfer.files)) }}>
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-teal-700 shadow-sm"><ImagePlus size={22} /></span><strong className="mt-4">Drag photos here or browse</strong><span className="mt-1 text-sm text-slate-500">High-resolution landscape images work best</span>
            <input accept="image/jpeg,image/png,image/webp" className="sr-only" multiple onChange={(event: ChangeEvent<HTMLInputElement>) => addFiles(Array.from(event.target.files ?? []))} type="file" />
          </label>
          {previews.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{previews.map((preview, index) => <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl" key={preview}><img alt={`Upload preview ${index + 1}`} className="h-full w-full object-cover" src={preview} /><button aria-label="Remove image" className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-slate-950/75 text-white opacity-0 transition group-hover:opacity-100" onClick={() => setFiles((current) => current.filter((_, item) => item !== index))} type="button"><X size={15} /></button></div>)}</div>}
        </FormSection>
        <FormSection number="03" title="Pin the exact location" copy="Click the map or drag the marker to help guests understand the area.">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><LocationPicker onChange={setLocation} value={location} /><div className="space-y-4"><Field label="Street address"><input className={inputClass} name="line1" required /></Field><div className="grid grid-cols-2 gap-3"><Field label="City"><input className={inputClass} name="city" required /></Field><Field label="Region"><input className={inputClass} name="region" required /></Field></div><div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500"><MapPin className="mr-2 inline text-teal-700" size={15} />{location[1]}, {location[0]}</div><button className="flex items-center gap-2 text-sm font-bold text-teal-700" onClick={useCurrentLocation} type="button"><LocateFixed size={17} /> Use my current location</button></div></div>
        </FormSection>
        {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">{error}</p>}
        {success && <p className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-800"><CheckCircle2 size={18} /> Your stay is live. Taking you to the listing...</p>}
        <div className="flex justify-end"><button className="flex items-center gap-2 rounded-2xl bg-slate-950 px-7 py-4 font-bold text-white transition hover:bg-teal-700 disabled:opacity-60" disabled={busy}>{busy && <LoaderCircle className="animate-spin" size={18} />}{busy ? 'Publishing your stay...' : 'Publish property'}</button></div>
      </form>
    </PageShell>
  )
}

function FormSection({ number, title, copy, children }: { number: string; title: string; copy: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-7 flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">{number}</span><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{copy}</p></div></div><div className="space-y-5">{children}</div></section>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-slate-700">{label}{children}</label>
}
