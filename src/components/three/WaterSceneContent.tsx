'use client'

import { useRef, useMemo, useEffect, useState } from 'react'

// Vertex shader with simplex noise for water waves
const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;

    // Multiple wave layers for realistic water
    float wave1 = snoise(vec3(position.x * 0.8, position.y * 0.8, uTime * 0.3)) * 0.15;
    float wave2 = snoise(vec3(position.x * 1.5, position.y * 1.5, uTime * 0.5)) * 0.08;
    float wave3 = snoise(vec3(position.x * 3.0, position.y * 3.0, uTime * 0.8)) * 0.03;

    float elevation = wave1 + wave2 + wave3;
    vElevation = elevation;

    vec3 newPosition = position;
    newPosition.z += elevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

// Fragment shader for water coloring
const fragmentShader = `
  uniform vec3 uColorDeep;
  uniform vec3 uColorShallow;
  uniform vec3 uColorFoam;
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Mix colors based on elevation
    float mixStrength = (vElevation + 0.15) * 3.0;
    mixStrength = clamp(mixStrength, 0.0, 1.0);

    vec3 color = mix(uColorDeep, uColorShallow, mixStrength);

    // Add foam on peaks
    float foamThreshold = 0.12;
    if (vElevation > foamThreshold) {
      float foamStrength = (vElevation - foamThreshold) * 10.0;
      foamStrength = clamp(foamStrength, 0.0, 0.4);
      color = mix(color, uColorFoam, foamStrength);
    }

    // Subtle gradient from top to bottom
    color = mix(color, uColorDeep * 0.7, vUv.y * 0.3);

    gl_FragColor = vec4(color, 0.95);
  }
`

// Inner scene content that uses Three.js - only rendered after client-side mount
function ThreeScene() {
  // Dynamic imports inside component to prevent SSR evaluation
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Canvas, useFrame, extend } = require('@react-three/fiber')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { shaderMaterial } = require('@react-three/drei')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const THREE = require('three')

  const [materialReady, setMaterialReady] = useState(false)

  // Create and extend material on mount
  useEffect(() => {
    const WaterMaterial = shaderMaterial(
      {
        uTime: 0,
        uColorDeep: new THREE.Color('#0369a1'),
        uColorShallow: new THREE.Color('#38bdf8'),
        uColorFoam: new THREE.Color('#ffffff'),
      },
      vertexShader,
      fragmentShader
    )
    extend({ WaterMaterial })
    setMaterialReady(true)
  }, [THREE.Color, extend, shaderMaterial])

  // Water component
  function Water() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const materialRef = useRef<any>(null)

    useFrame((state: { clock: { elapsedTime: number } }) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      }
    })

    if (!materialReady) return null

    return (
      <mesh rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[10, 10, 128, 128]} />
        {/* @ts-expect-error - Custom shader material */}
        <waterMaterial ref={materialRef} transparent />
      </mesh>
    )
  }

  // Floating bubbles component
  function FloatingBubbles() {
    const count = 30
    const bubbles = useMemo(() => {
      return Array.from({ length: count }, () => ({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4 - 2,
          (Math.random() - 0.5) * 4
        ] as [number, number, number],
        scale: Math.random() * 0.08 + 0.02,
        speed: Math.random() * 0.5 + 0.3,
        offset: Math.random() * Math.PI * 2
      }))
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupRef = useRef<any>(null)

    useFrame((state: { clock: { elapsedTime: number } }) => {
      if (groupRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        groupRef.current.children.forEach((bubble: any, i: number) => {
          const data = bubbles[i]
          bubble.position.y = data.position[1] + Math.sin(state.clock.elapsedTime * data.speed + data.offset) * 0.3
          bubble.position.x = data.position[0] + Math.sin(state.clock.elapsedTime * 0.2 + data.offset) * 0.1
        })
      }
    })

    return (
      <group ref={groupRef}>
        {bubbles.map((bubble, i) => (
          <mesh key={i} position={bubble.position}>
            <sphereGeometry args={[bubble.scale, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
    )
  }

  // Caustic light component
  function CausticLight() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lightRef = useRef<any>(null)

    useFrame((state: { clock: { elapsedTime: number } }) => {
      if (lightRef.current) {
        lightRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5
        lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 2
      }
    })

    return (
      <>
        <ambientLight intensity={0.6} />
        <pointLight ref={lightRef} position={[2, 3, 2]} intensity={1.5} color="#87CEEB" />
        <pointLight position={[-3, 2, -2]} intensity={0.8} color="#0ea5e9" />
      </>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)' }}
      onCreated={(state: { gl: { setPixelRatio: (ratio: number) => void } }) => {
        state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      }}
    >
      <CausticLight />
      <Water />
      <FloatingBubbles />
      <fog attach="fog" args={['#0c4a6e', 3, 12]} />
    </Canvas>
  )
}

export default function WaterSceneContent() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render anything on server
  if (!isMounted) {
    return (
      <div
        className="w-full h-full"
        style={{ background: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)' }}
      />
    )
  }

  return <ThreeScene />
}
