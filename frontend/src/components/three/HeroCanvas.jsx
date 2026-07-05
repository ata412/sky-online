import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useRef, useMemo, useEffect, Suspense } from 'react'
import * as THREE from 'three'

const GOLD = '#c9a84c'
const BLUE = '#60a5fa'
const GOLD_LIGHT = '#e8d278'

// ── Stars — slowest layer ────────────────────────────────────────
function StarLayer({ mouse }) {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    ref.current.position.x += (mouse.current[0] * 5 - ref.current.position.x) * 0.04
    ref.current.position.y += (mouse.current[1] * 4 - ref.current.position.y) * 0.04
  })
  return (
    <group ref={ref}>
      <Stars radius={90} depth={60} count={900} factor={4} saturation={0} fade speed={0.4} />
    </group>
  )
}

// ── Gold particle cloud — medium layer ──────────────────────────
function GoldParticles({ mouse }) {
  const ref = useRef()
  const geometry = useMemo(() => {
    const count = 600
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
      const g = Math.random() > 0.35
      col[i * 3]     = g ? 0.788 : 1
      col[i * 3 + 1] = g ? 0.659 : 1
      col[i * 3 + 2] = g ? 0.298 : 1
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return geo
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.y = t * 0.018
    ref.current.rotation.x = Math.sin(t * 0.012) * 0.06
    ref.current.position.x += (mouse.current[0] * 12 - ref.current.position.x) * 0.07
    ref.current.position.y += (mouse.current[1] * 10 - ref.current.position.y) * 0.07
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.16} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  )
}

// ── Wireframe icosahedron — parallax + lean ──────────────────────
function WireOrb({ initPos, color = GOLD, scale = 1, rotSpeed = 0.25, mouse, shift = 4 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.x = t * rotSpeed + mouse.current[1] * -0.5
    ref.current.rotation.y = t * rotSpeed * 1.5 + mouse.current[0] * 0.5
    ref.current.position.x += (initPos[0] + mouse.current[0] * shift - ref.current.position.x) * 0.06
    ref.current.position.y += (initPos[1] + mouse.current[1] * shift * 0.8 - ref.current.position.y) * 0.06
  })
  return (
    <mesh ref={ref} position={initPos} scale={scale}>
      <icosahedronGeometry args={[1.5, 1]} />
      <meshStandardMaterial color={color} wireframe transparent opacity={0.6} />
    </mesh>
  )
}

// ── Pulsing glow orb — nearest layer ────────────────────────────
function GlowOrb({ initPos, color = GOLD, scale = 0.25, mouse, shift = 5 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.scale.setScalar(scale + Math.sin(t * 1.8 + initPos[0]) * 0.05)
    ref.current.position.x += (initPos[0] + mouse.current[0] * shift - ref.current.position.x) * 0.07
    ref.current.position.y += (initPos[1] + mouse.current[1] * shift * 0.8 - ref.current.position.y) * 0.07
  })
  return (
    <mesh ref={ref} position={initPos}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.85} />
    </mesh>
  )
}

function Scene({ mouse }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[2, 2, 6]} intensity={3} color={GOLD} />
      <pointLight position={[-10, -8, -5]} intensity={1} color={BLUE} />
      <StarLayer mouse={mouse} />
      <GoldParticles mouse={mouse} />
      {/* shift = how many world-units the orb moves per mouse-unit (nearer = bigger shift) */}
      <WireOrb initPos={[7, 1, -3]}   scale={1.3} rotSpeed={0.20} mouse={mouse} shift={5} />
      <WireOrb initPos={[-8, -2, -6]} color={BLUE}       scale={0.9} rotSpeed={0.13} mouse={mouse} shift={3} />
      <WireOrb initPos={[1, 4, -9]}   scale={2.0} rotSpeed={0.08} mouse={mouse} shift={1.5} />
      <WireOrb initPos={[-4, 3, -2]}  color={GOLD_LIGHT} scale={0.5} rotSpeed={0.35} mouse={mouse} shift={6} />
      <GlowOrb initPos={[5, -2, -1]}  color={GOLD}       scale={0.22} mouse={mouse} shift={6} />
      <GlowOrb initPos={[-6, 3, -2]}  color={BLUE}       scale={0.14} mouse={mouse} shift={6} />
      <GlowOrb initPos={[3, 5, -5]}   color={GOLD_LIGHT} scale={0.18} mouse={mouse} shift={2.5} />
    </>
  )
}

export default function HeroCanvas() {
  const mouse = useRef([0, 0])

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      ]
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 13], fov: 65 }}
      gl={{ alpha: true, antialias: true }}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%', pointerEvents: 'none',
      }}
    >
      <Suspense fallback={null}>
        <Scene mouse={mouse} />
      </Suspense>
    </Canvas>
  )
}
