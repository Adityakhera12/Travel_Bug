import { Compass, Globe2, HeartHandshake, ShieldCheck } from 'lucide-react'
import { PageShell } from '../components/SiteChrome'

export default function AboutPage() {
  return (
    <PageShell>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid min-h-[34rem] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8">
          <div><p className="text-sm font-bold uppercase tracking-[.15em] text-teal-300">Our story</p><h1 className="mt-3 font-serif text-5xl font-semibold leading-tight sm:text-6xl">Travel changes when the stay feels personal.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Travel Bug brings distinctive homes, useful local context, and accountable reviews together in one thoughtful place.</p></div>
          <img alt="Sailboat crossing a bright blue bay near a coastal town" className="h-96 w-full rounded-3xl object-cover" src="https://images.unsplash.com/photo-1771589234205-6e4d9c45b2ae?auto=format&fit=crop&w=1200&q=85" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            [Compass, 'Curiosity first', 'We make room for discovery beyond the obvious itinerary.'],
            [ShieldCheck, 'Trust by design', 'Secure accounts and validated input protect every community interaction.'],
            [Globe2, 'Location matters', 'Map-first exploration gives every stay its real-world context.'],
            [HeartHandshake, 'Human stories', 'Reviews should be useful, accountable, and grounded in genuine experience.'],
          ].map(([Icon, title, copy]) => {
            const ValueIcon = Icon as typeof Compass
            return <article className="rounded-3xl border border-slate-200 bg-white p-6" key={String(title)}><ValueIcon className="text-teal-700" size={25} /><h2 className="mt-5 text-lg font-bold">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{String(copy)}</p></article>
          })}
        </div>
      </section>
    </PageShell>
  )
}
