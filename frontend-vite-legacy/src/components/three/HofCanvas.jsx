import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { useMemo, useRef, Suspense } from 'react'

const COLORS = [
  '#c9a84c', '#e8d278', '#60a5fa', '#a78bfa',
  '#f0d878', '#94a3b8', '#34d399', '#fb923c',
]

function DiamondGem({ position, color, scale, speed, rotSpeed }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.y = t * rotSpeed
    ref.current.rotation.x = Math.sin(t * 0.6 + position[0]) * 0.4
  })
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.9}>
      <mesh ref={ref} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.05} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </Float>
  )
}

function RingShape({ position, color, scale, speed }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = state.clock.getElapsedTime() * 0.6
    ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.5
  })
  return (
    <Float speed={speed} floatIntensity={1}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusGeometry args={[0.6, 0.15, 8, 12]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </Float>
  )
}

function CrownStar({ position, color, scale, speed }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.8
    ref.current.rotation.z = state.clock.getElapsedTime() * 0.4
  })
  return (
    <Float speed={speed} floatIntensity={0.8}>
      <mesh ref={ref} position={position} scale={scale}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.15} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </Float>
  )
}

function Scene({ shapes }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#c9a84c" />
      <pointLight position={[-5, -5, 5]} intensity={1.2} color="#60a5fa" />
      <pointLight position={[0, 0, 8]} intensity={0.8} color="#ffffff" />
      {shapes.map((s, i) =>
        s.type === 'diamond' ? (
          <DiamondGem key={i} {...s} />
        ) : s.type === 'ring' ? (
          <RingShape key={i} {...s} />
        ) : (
          <CrownStar key={i} {...s} />
        )
      )}
    </>
  )
}

export default function HofCanvas() {
  const shapes = useMemo(() => {
    const types = ['diamond', 'ring', 'star']
    return Array.from({ length: 28 }, (_, i) => ({
      position: [(Math.random() - 0.5) * 28, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      scale: 0.06 + Math.random() * 0.28,
      speed: 0.6 + Math.random() * 1.8,
      rotSpeed: 0.2 + Math.random() * 0.9,
      type: types[Math.floor(Math.random() * types.length)],
    }))
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 62 }}
      gl={{ alpha: true, antialias: true }}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%', pointerEvents: 'none',
      }}
    >
      <Suspense fallback={null}>
        <Scene shapes={shapes} />
      </Suspense>
    </Canvas>
  )
}
