'use client'

import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'

export type MapProperty = {
  id: string
  title: string
  price: number
  location: [number, number]
}

export function PropertyMap({ properties }: { properties: MapProperty[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  useEffect(() => {
    if (!containerRef.current || !token) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: properties[0]?.location ?? [-73.9857, 40.7484],
      zoom: properties.length ? 10 : 9,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    const bounds = new mapboxgl.LngLatBounds()
    properties.forEach((property) => {
      const element = document.createElement('button')
      element.className = 'map-price-marker'
      element.type = 'button'
      element.textContent = `$${Math.round(property.price).toLocaleString()}`
      element.setAttribute('aria-label', `${property.title}, $${property.price.toLocaleString()} per night`)

      new mapboxgl.Marker({ element })
        .setLngLat(property.location)
        .setPopup(
          new mapboxgl.Popup({ offset: 18 }).setHTML(
            `<strong>${property.title.replace(/[<>&"']/g, '')}</strong><br>$${property.price.toLocaleString()} / night`,
          ),
        )
        .addTo(map)
      bounds.extend(property.location)
    })

    if (properties.length > 1) {
      map.fitBounds(bounds, { padding: 70, maxZoom: 12 })
    }

    return () => map.remove()
  }, [properties, token])

  if (!token) {
    return (
      <div className="grid h-full place-items-center bg-stone-100 p-8 text-center text-sm text-stone-500">
        Add a Mapbox public token to view the interactive map.
      </div>
    )
  }

  return <div ref={containerRef} className="h-full min-h-[28rem] w-full" aria-label="Property map" />
}
