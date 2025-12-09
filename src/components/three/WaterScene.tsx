'use client'

// Temporarily disabled 3D scene to debug production error
// The Three.js scene was causing "Cannot read properties of undefined (reading 'S')"

export function WaterScene() {
  // Just show the gradient fallback for now
  return (
    <div
      className="absolute inset-0 z-0"
      style={{ background: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)' }}
    />
  )
}
