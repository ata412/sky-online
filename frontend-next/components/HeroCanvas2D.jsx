'use client';

import { useRef, useEffect } from 'react'

const LC = [200, 155, 240]  // soft lavender constellation line colour

// 3 constellations (reduced from 5)
const CONSTELLATIONS = [
  {
    name: 'Orion',
    cx: 0.76, cy: 0.46, scale: 0.19, depth: 0.35,
    stars: [
      { lx: -0.42, ly: -0.44, r: 3.4, col: [255, 200, 160] }, // Betelgeuse – orange-red
      { lx:  0.52, ly: -0.38, r: 2.4, col: [200, 215, 255] }, // Bellatrix
      { lx: -0.52, ly:  0.06, r: 2.2, col: [200, 215, 255] }, // Alnitak
      { lx:  0.00, ly:  0.00, r: 2.5, col: [200, 215, 255] }, // Alnilam
      { lx:  0.52, ly: -0.06, r: 2.0, col: [200, 215, 255] }, // Mintaka
      { lx: -0.36, ly:  0.52, r: 2.0, col: [200, 215, 255] }, // Saiph
      { lx:  0.58, ly:  0.56, r: 3.8, col: [170, 205, 255] }, // Rigel – blue-white
      { lx:  0.05, ly: -0.62, r: 1.8, col: [210, 215, 255] }, // Meissa
    ],
    lines: [[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[0,7],[1,7]],
  },
  {
    name: 'Corona Borealis',
    cx: 0.17, cy: 0.17, scale: 0.14, depth: 0.15,
    stars: [
      { lx: -1.00, ly:  0.58, r: 1.7, col: [210, 215, 255] }, // θ CrB – left end
      { lx: -0.68, ly: -0.10, r: 2.1, col: [220, 225, 255] }, // β CrB
      { lx: -0.22, ly: -0.65, r: 2.9, col: [200, 215, 255] }, // Alphecca – brightest, blue-white
      { lx:  0.26, ly: -0.60, r: 1.9, col: [210, 215, 255] }, // γ CrB
      { lx:  0.64, ly: -0.12, r: 1.8, col: [255, 210, 155] }, // ε CrB – warm orange
      { lx:  0.90, ly:  0.38, r: 1.7, col: [210, 215, 255] }, // ι CrB
      { lx:  1.00, ly:  0.70, r: 1.5, col: [200, 210, 255] }, // right end
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  {
    name: 'Scorpius',
    cx: 0.30, cy: 0.68, scale: 0.15, depth: 0.60,
    stars: [
      { lx: -0.32, ly: -1.00, r: 2.0, col: [210, 215, 255] }, // Graffias
      { lx:  0.32, ly: -0.80, r: 2.0, col: [210, 215, 255] }, // Dschubba
      { lx:  0.00, ly: -0.38, r: 3.8, col: [255, 120,  90] }, // Antares – red supergiant
      { lx: -0.10, ly:  0.02, r: 1.8, col: [210, 215, 255] },
      { lx: -0.28, ly:  0.30, r: 2.0, col: [255, 210, 160] },
      { lx: -0.50, ly:  0.58, r: 1.9, col: [210, 215, 255] },
      { lx: -0.68, ly:  0.78, r: 1.8, col: [210, 215, 255] },
      { lx: -0.76, ly:  1.00, r: 1.6, col: [200, 210, 255] },
      { lx: -0.56, ly:  1.22, r: 2.2, col: [210, 215, 255] }, // stinger
    ],
    lines: [[0,2],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
  },
]

// Independent bright stars scattered around (no constellation lines)
const BRIGHT_STARS = [
  { cx: 0.10, cy: 0.38, r: 3.0, col: [255, 240, 200], depth: 0.42 },
  { cx: 0.25, cy: 0.18, r: 2.5, col: [180, 210, 255], depth: 0.28 },
  { cx: 0.42, cy: 0.08, r: 3.2, col: [255, 255, 255], depth: 0.50 },
  { cx: 0.55, cy: 0.30, r: 2.2, col: [200, 215, 255], depth: 0.35 },
  { cx: 0.63, cy: 0.72, r: 2.8, col: [255, 220, 170], depth: 0.55 },
  { cx: 0.85, cy: 0.32, r: 2.0, col: [210, 215, 255], depth: 0.22 },
  { cx: 0.92, cy: 0.65, r: 3.5, col: [255, 200, 150], depth: 0.60 }, // warm giant
  { cx: 0.08, cy: 0.72, r: 2.3, col: [200, 215, 255], depth: 0.45 },
  { cx: 0.38, cy: 0.85, r: 2.7, col: [255, 230, 180], depth: 0.38 },
  { cx: 0.72, cy: 0.14, r: 2.1, col: [210, 215, 255], depth: 0.18 },
  { cx: 0.18, cy: 0.55, r: 4.0, col: [255, 195, 130], depth: 0.52 }, // bright orange giant
  { cx: 0.48, cy: 0.52, r: 2.4, col: [180, 215, 255], depth: 0.40 },
  { cx: 0.82, cy: 0.80, r: 2.9, col: [255, 245, 220], depth: 0.35 },
  { cx: 0.35, cy: 0.42, r: 3.3, col: [190, 220, 255], depth: 0.48 }, // bright blue-white
  { cx: 0.60, cy: 0.92, r: 2.0, col: [210, 215, 255], depth: 0.30 },
  { cx: 0.93, cy: 0.22, r: 2.6, col: [255, 240, 210], depth: 0.44 },
  { cx: 0.05, cy: 0.50, r: 2.2, col: [200, 215, 255], depth: 0.32 },
]

// Nebula clouds – evening sky palette
const NEBULAE = [
  // Large diffuse twilight haze
  { cx: 0.38, cy: 0.52, r: 0.30, col: [140,  70, 180], op: 0.026, depth: 0.03 }, // deep purple
  { cx: 0.62, cy: 0.44, r: 0.26, col: [100,  55, 160], op: 0.020, depth: 0.05 }, // indigo
  { cx: 0.50, cy: 0.28, r: 0.22, col: [190,  75, 145], op: 0.024, depth: 0.04 }, // magenta band
  // Medium evening clouds
  { cx: 0.76, cy: 0.50, r: 0.09, col: [210, 110, 185], op: 0.11, depth: 0.35 }, // rose (Orion area)
  { cx: 0.30, cy: 0.64, r: 0.07, col: [230,  90,  80], op: 0.09, depth: 0.60 }, // warm coral (Antares)
  { cx: 0.12, cy: 0.45, r: 0.10, col: [155,  95, 225], op: 0.08, depth: 0.25 }, // violet
  { cx: 0.60, cy: 0.20, r: 0.08, col: [225, 140, 200], op: 0.06, depth: 0.30 }, // pink-lavender
  { cx: 0.86, cy: 0.72, r: 0.11, col: [255, 150, 110], op: 0.05, depth: 0.20 }, // amber-rose
  { cx: 0.42, cy: 0.80, r: 0.09, col: [175, 110, 230], op: 0.05, depth: 0.40 }, // violet-purple
]

export default function HeroCanvas2D() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let raf
    let W = 0, H = 0, S = 0
    const mouse = { nx: 0, ny: 0, sx: 0, sy: 0 }

    const setSize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      S = Math.min(W, H)
    }
    setSize()

    const onMove = (e) => {
      mouse.nx = (e.clientX / window.innerWidth)  * 2 - 1
      mouse.ny = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', setSize)

    // Background star field
    const BG = Array.from({ length: 280 }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      r:     Math.random() * 1.0 + 0.15,
      op:    Math.random() * 0.30 + 0.08,
      freq:  Math.random() * 1.8 + 0.4,
      phase: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.15,
      col:   Math.random() > 0.6
        ? [235, 205, 255]   // lavender-white
        : Math.random() > 0.4
          ? [255, 215, 240] // warm pink-white
          : [255, 255, 255],
    }))

    // Pre-assign twinkling params
    CONSTELLATIONS.forEach(c => c.stars.forEach(s => {
      s.freq       = Math.random() * 1.6 + 0.4
      s.phase      = Math.random() * Math.PI * 2
      s.baseOp     = 0.75 + Math.random() * 0.25
      s.spikeAngle = Math.random() * Math.PI / 4
    }))

    // Per-star spring physics (displacement + velocity)
    const physics = CONSTELLATIONS.map(c => c.stars.map(() => ({ dx: 0, dy: 0, vx: 0, vy: 0 })))
    BRIGHT_STARS.forEach(s => {
      s.freq       = Math.random() * 1.4 + 0.3
      s.phase      = Math.random() * Math.PI * 2
      s.baseOp     = 0.70 + Math.random() * 0.30
      s.spikeAngle = Math.random() * Math.PI / 4
    })

    // Shooting stars pool
    const shoots = []
    let nextShoot = 0.05 + Math.random() * 0.15

    const drawStar = (x, y, r, col, op, spikeAngle = 0) => {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${op})`
      ctx.fill()

      if (r > 2.0) {
        const glowR = r * (r > 3.5 ? 7 : 5.5)
        const gr = ctx.createRadialGradient(x, y, 0, x, y, glowR)
        gr.addColorStop(0,   `rgba(${col[0]},${col[1]},${col[2]},${+(op * 0.4).toFixed(3)})`)
        gr.addColorStop(0.4, `rgba(${col[0]},${col[1]},${col[2]},${+(op * 0.08).toFixed(3)})`)
        gr.addColorStop(1,   `rgba(${col[0]},${col[1]},${col[2]},0)`)
        ctx.beginPath()
        ctx.arc(x, y, glowR, 0, Math.PI * 2)
        ctx.fillStyle = gr
        ctx.fill()
      }

    }

    let t = 0

    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      mouse.sx += (mouse.nx - mouse.sx) * 0.055
      mouse.sy += (mouse.ny - mouse.sy) * 0.055

      // ── Twilight sky atmospheric layers ───────────────────────
      // Upper purple twilight glow
      const tg = ctx.createLinearGradient(0, 0, 0, H * 0.6)
      tg.addColorStop(0,   'rgba(30, 10, 70, 0.18)')
      tg.addColorStop(0.5, 'rgba(70, 20, 100, 0.10)')
      tg.addColorStop(1,   'rgba(100, 30, 80, 0)')
      ctx.fillStyle = tg
      ctx.fillRect(0, 0, W, H)

      // Horizon warm glow — sunset remnant (strong, visible)
      const hg = ctx.createLinearGradient(0, H * 0.42, 0, H)
      hg.addColorStop(0,    'rgba(160,  50,  60, 0)')
      hg.addColorStop(0.30, 'rgba(200,  70,  50, 0.14)')
      hg.addColorStop(0.62, 'rgba(230,  95,  35, 0.26)')
      hg.addColorStop(0.85, 'rgba(210,  80,  25, 0.38)')
      hg.addColorStop(1,    'rgba(170,  55,  15, 0.45)')
      ctx.fillStyle = hg
      ctx.fillRect(0, 0, W, H)

      // Warm side glow (left horizon bleed)
      const sg = ctx.createRadialGradient(W * 0.15, H, 0, W * 0.15, H, W * 0.55)
      sg.addColorStop(0,   'rgba(230, 100, 40, 0.18)')
      sg.addColorStop(0.5, 'rgba(180,  60, 60, 0.06)')
      sg.addColorStop(1,   'rgba(150,  40, 80, 0)')
      ctx.fillStyle = sg
      ctx.fillRect(0, 0, W, H)

      // ── Milky Way band (dusk magenta-purple tone) ─────────────
      ctx.save()
      ctx.translate(W * 0.5 + mouse.sx * 8, H * 0.5 + mouse.sy * 6)
      ctx.rotate(-0.32)
      const mwH = H * 0.50
      const mwW = W * 1.7
      const mw = ctx.createLinearGradient(0, -mwH / 2, 0, mwH / 2)
      mw.addColorStop(0,    'rgba(160, 55, 180, 0)')
      mw.addColorStop(0.32, 'rgba(175, 65, 190, 0.020)')
      mw.addColorStop(0.50, 'rgba(190, 78, 200, 0.036)')
      mw.addColorStop(0.68, 'rgba(175, 65, 190, 0.020)')
      mw.addColorStop(1,    'rgba(160, 55, 180, 0)')
      ctx.fillStyle = mw
      ctx.fillRect(-mwW / 2, -mwH / 2, mwW, mwH)
      ctx.restore()

      // ── nebula glows ──────────────────────────────────────────
      NEBULAE.forEach(n => {
        const px = mouse.sx * n.depth * S * 0.07
        const py = mouse.sy * n.depth * S * 0.055
        const cx = n.cx * W + px
        const cy = n.cy * H + py
        const nr = n.r * S
        const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, nr)
        g.addColorStop(0,   `rgba(${n.col[0]},${n.col[1]},${n.col[2]},${n.op})`)
        g.addColorStop(0.5, `rgba(${n.col[0]},${n.col[1]},${n.col[2]},${+(n.op * 0.4).toFixed(3)})`)
        g.addColorStop(1,   `rgba(${n.col[0]},${n.col[1]},${n.col[2]},0)`)
        ctx.beginPath()
        ctx.arc(cx, cy, nr, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })

      // ── background stars ──────────────────────────────────────
      BG.forEach(s => {
        const twinkle    = Math.sin(t * s.freq + s.phase) * 0.10
        const depthScale = 0.22 + (s.depth / 0.15) * 0.78  // far=0.22× dim, near=1.0×
        const op = Math.max(0.02, Math.min(0.38, (s.op + twinkle) * depthScale))
        const px = mouse.sx * s.depth * 28
        const py = mouse.sy * s.depth * 22
        const sx = ((s.x * W + px) % W + W) % W
        const sy = ((s.y * H + py) % H + H) % H
        ctx.beginPath()
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${op})`
        ctx.fill()
      })

      // ── bright independent stars ──────────────────────────────
      BRIGHT_STARS.forEach(s => {
        const twinkle = Math.sin(t * s.freq + s.phase) * 0.22
        const op = Math.max(0.35, Math.min(1, s.baseOp + twinkle))
        const px = mouse.sx * s.depth * S * 0.09
        const py = mouse.sy * s.depth * S * 0.07
        drawStar(s.cx * W + px, s.cy * H + py, s.r, s.col, op, s.spikeAngle)
      })

      // ── constellations (with spring physics) ─────────────────
      // Raw mouse in canvas coords for repulsion
      const mxR = (mouse.nx + 1) / 2 * W
      const myR = (mouse.ny + 1) / 2 * H
      const repelR = S * 0.13

      CONSTELLATIONS.forEach((c, ci) => {
        const px = mouse.sx * c.depth * S * 0.09
        const py = mouse.sy * c.depth * S * 0.07
        const ox = c.cx * W + px
        const oy = c.cy * H + py
        const sc = c.scale * S

        // Update physics + compute world positions
        const wp = c.stars.map((s, si) => {
          const ph  = physics[ci][si]
          const x0  = ox + s.lx * sc
          const y0  = oy + s.ly * sc
          const cx  = x0 + ph.dx
          const cy  = y0 + ph.dy

          // Mouse repulsion (slow, gentle)
          const mdx  = cx - mxR
          const mdy  = cy - myR
          const dist = Math.sqrt(mdx * mdx + mdy * mdy)
          if (dist < repelR && dist > 0.5) {
            const force = (1 - dist / repelR) * 2.0
            ph.vx += (mdx / dist) * force
            ph.vy += (mdy / dist) * force
          }

          // Spring toward resting position (slow return)
          ph.vx -= ph.dx * 0.022
          ph.vy -= ph.dy * 0.022
          // Damping (high = sluggish movement)
          ph.vx *= 0.91
          ph.vy *= 0.91
          // Integrate
          ph.dx += ph.vx
          ph.dy += ph.vy

          return { x: x0 + ph.dx, y: y0 + ph.dy }
        })

        ctx.save()
        ctx.lineWidth = 0.85
        const BREAK = 6  // pixels of displacement before line snaps
        c.lines.forEach(([i, j]) => {
          const pi = physics[ci][i]
          const pj = physics[ci][j]
          const di = Math.sqrt(pi.dx * pi.dx + pi.dy * pi.dy)
          const dj = Math.sqrt(pj.dx * pj.dx + pj.dy * pj.dy)
          if (di > BREAK || dj > BREAK) return  // line snaps
          const g = ctx.createLinearGradient(wp[i].x, wp[i].y, wp[j].x, wp[j].y)
          g.addColorStop(0,   `rgba(${LC[0]},${LC[1]},${LC[2]},0.35)`)
          g.addColorStop(0.5, `rgba(${LC[0]},${LC[1]},${LC[2]},0.18)`)
          g.addColorStop(1,   `rgba(${LC[0]},${LC[1]},${LC[2]},0.35)`)
          ctx.strokeStyle = g
          ctx.beginPath()
          ctx.moveTo(wp[i].x, wp[i].y)
          ctx.lineTo(wp[j].x, wp[j].y)
          ctx.stroke()
        })
        ctx.restore()

        c.stars.forEach((s, i) => {
          const twinkle = Math.sin(t * s.freq + s.phase) * 0.18
          const op = Math.max(0.3, Math.min(1, s.baseOp + twinkle))
          drawStar(wp[i].x, wp[i].y, s.r, s.col, op, s.spikeAngle)
        })
      })

      // ── shooting stars ────────────────────────────────────────
      nextShoot -= 0.016
      if (nextShoot <= 0) {
        // Spawn 1-3 meteors at once (burst effect)
        const burst = Math.random() > 0.75 ? 3 : Math.random() > 0.45 ? 2 : 1
        for (let b = 0; b < burst; b++) {
          const sizeRoll = Math.random()
          const sz = sizeRoll > 0.92 ? 'L'
                   : sizeRoll > 0.72 ? 'M'
                   : sizeRoll > 0.38 ? 'S'
                   : 'XS'
          const cfg = {
            XS: { speed: 3 + Math.random() * 2,  len:  30 + Math.random() *  25, lw: 0.5, hr: 0.7, decay: 0.042 },
            S:  { speed: 5 + Math.random() * 3,  len:  60 + Math.random() *  45, lw: 0.9, hr: 1.1, decay: 0.032 },
            M:  { speed: 7 + Math.random() * 4,  len: 105 + Math.random() *  65, lw: 1.5, hr: 1.7, decay: 0.025 },
            L:  { speed: 10 + Math.random() * 5, len: 175 + Math.random() *  95, lw: 2.2, hr: 2.6, decay: 0.018 },
          }[sz]
          // Radiant point: upper-left area — classic meteor shower
          const angle = 0.55 + Math.random() * 0.45
          shoots.push({
            x:     Math.random() * W,
            y:     Math.random() * H * 0.55,
            vx:    Math.cos(angle) * cfg.speed,
            vy:    Math.sin(angle) * cfg.speed,
            len:   cfg.len,
            lw:    cfg.lw,
            hr:    cfg.hr,
            decay: cfg.decay,
            life:  1.0,
          })
        }
        nextShoot = 0.06 + Math.random() * 0.22
      }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const sh = shoots[i]
        sh.x += sh.vx
        sh.y += sh.vy
        sh.life -= sh.decay
        if (sh.life <= 0) { shoots.splice(i, 1); continue }
        const mag   = Math.sqrt(sh.vx * sh.vx + sh.vy * sh.vy)
        const tailX = sh.x - (sh.vx / mag) * sh.len
        const tailY = sh.y - (sh.vy / mag) * sh.len
        const alpha = sh.life * 0.88
        const sg = ctx.createLinearGradient(tailX, tailY, sh.x, sh.y)
        sg.addColorStop(0,    'rgba(255,255,255,0)')
        sg.addColorStop(0.55, `rgba(255,255,255,${+(alpha * 0.35).toFixed(3)})`)
        sg.addColorStop(1,    `rgba(255,255,255,${alpha})`)
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(sh.x, sh.y)
        ctx.strokeStyle = sg
        ctx.lineWidth   = sh.lw
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(sh.x, sh.y, sh.hr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', setSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
      }}
    />
  )
}
