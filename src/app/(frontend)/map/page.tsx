import { Suspense } from 'react'
import { ExploreExperience } from '../components/ExploreExperience'

export default function MapPage() {
  return <Suspense><ExploreExperience initialMap /></Suspense>
}
