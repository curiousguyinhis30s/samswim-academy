'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the 3D scene with SSR disabled
const WaterSceneContent = dynamic(
  () => import('./WaterSceneContent'),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(180deg, #134E4A 0%, #0D9488 50%, #14B8A6 100%)' }}
      />
    )
  }
)

export function WaterScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Suspense
        fallback={
          <div
            className="w-full h-full"
            style={{ background: 'linear-gradient(180deg, #134E4A 0%, #0D9488 50%, #14B8A6 100%)' }}
          />
        }
      >
        <WaterSceneContent />
      </Suspense>
    </div>
  )
}
