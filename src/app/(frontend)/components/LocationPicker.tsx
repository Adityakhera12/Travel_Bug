'use client'

import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

export function LocationPicker({ value, onChange }: { value: [number, number]; onChange: (value: [number, number]) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current || !token) return
    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({ container: containerRef.current, style: 'mapbox://styles/mapbox/light-v11', center: value, zoom: 11, attributionControl: false })
    const marker = new mapboxgl.Marker({ color: '#0f766e', draggable: true }).setLngLat(value).addTo(map)
    const update = () => {
      const { lng, lat } = marker.getLngLat()
      onChangeRef.current([Number(lng.toFixed(6)), Number(lat.toFixed(6))])
    }
    marker.on('dragend', update)
    map.on('click', (event) => {
      marker.setLngLat(event.lngLat)
      update()
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    return () => map.remove()
  }, [token])

  if (!token) return <div className="grid h-64 place-items-center rounded-2xl bg-slate-100 p-6 text-center text-sm text-slate-500"><span><MapPin className="mx-auto mb-3 text-teal-700" />Map preview will appear when a Mapbox public token is connected. You can still enter coordinates below.</span></div>
  return <div className="h-64 overflow-hidden rounded-2xl" ref={containerRef} aria-label="Choose property location on map" />
}
