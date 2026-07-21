import { useRef } from 'react'

export function useTilt(maxTilt = 12) {
  const ref = useRef(null)

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotX = ((y - cy) / cy) * -maxTilt
    const rotY = ((x - cx) / cx) * maxTilt
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`
    el.style.transition = 'transform 0.1s ease-out'
  }

  const onMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'
    ref.current.style.transition = 'transform 0.5s ease-out'
  }

  return { ref, onMouseMove, onMouseLeave }
}
