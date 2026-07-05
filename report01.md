# Report 01 — ปัญหา Interactive Background และวิธีแก้

---

## ปัญหาที่ 1: @react-three/fiber ไม่รองรับ React 18

### อาการ
```
Uncaught TypeError: Cannot read properties of undefined (reading 'S')
at createReconciler (chunk-DBDASN2M.js)
```

### สาเหตุ
`package.json` ติดตั้ง `@react-three/fiber` เวอร์ชัน **9.x** ซึ่ง**ต้องการ React 19** แต่โปรเจกต์ใช้ **React 18.3.1**  
R3F v9 เรียกใช้ internal API ของ React ที่มีแค่ใน v19 (property `S` ใน reconciler) ทำให้ crash ทันทีตอน mount

| Package | เวอร์ชันเก่า (พัง) | เวอร์ชันใหม่ (ใช้ได้) |
|---|---|---|
| `@react-three/fiber` | `^9.6.1` | `^8.18.0` |
| `@react-three/drei` | `^10.7.7` | `^9.122.0` |
| React | 18.3.1 | 18.3.1 (ไม่เปลี่ยน) |

### วิธีแก้
```bash
npm install @react-three/fiber@8 @react-three/drei@9
```

---

## ปัญหาที่ 2: WebGL ไม่ available ในเบราว์เซอร์

### อาการ
```
[ErrorBoundary caught] Error: THREE.WebGLRenderer: Error creating WebGL context.
at Canvas (chunk-YHJE3IXY.js)
```

### สาเหตุ
Three.js ต้องการ **WebGL** ในการ render 3D scene  
เบราว์เซอร์ที่ใช้ทดสอบไม่รองรับ WebGL (อาจเกิดจาก hardware acceleration ถูกปิด หรือ GPU driver มีปัญหา)  
แม้ downgrade R3F เป็น v8 แล้ว Three.js ก็ยังใช้ไม่ได้

### วิธีแก้
เปลี่ยนจาก Three.js (WebGL) → **Canvas 2D API** ที่ทำงานได้ทุก browser  
สร้างไฟล์ใหม่ `src/components/HeroCanvas2D.jsx`:
- วาด particles 350 จุด (gold/white/blue) ด้วย `ctx.arc()`
- วาด gradient orbs 4 ชิ้นด้วย `createRadialGradient()`
- parallax effect ด้วย `mouse.nx * depth * 45` — จุดใกล้เคลื่อนมาก จุดไกลเคลื่อนน้อย
- ใช้ `requestAnimationFrame` วนลูปที่ 60fps

---

## ปัญหาที่ 3: ErrorBoundary ซ่อน error ไว้เงียบๆ

### อาการ
Three.js พังตั้งแต่ต้น แต่หน้าเว็บยังโหลดได้ปกติ — ไม่มี error ในหน้า จึงหาสาเหตุไม่ได้

### สาเหตุ
`ErrorBoundary` ใน `Home.jsx` มี `fallback={null}` และไม่มี `componentDidCatch` → error ถูกกลืนหายไม่แสดงที่ไหนเลย

```jsx
// ก่อนแก้ — ไม่รู้ว่า error อะไร
<ErrorBoundary fallback={null}>
  <HeroCanvas />
</ErrorBoundary>
```

### วิธีแก้
เพิ่ม `componentDidCatch` ใน `ErrorBoundary.jsx` เพื่อ log error ไปยัง console:
```js
componentDidCatch(error, info) {
  console.error('[ErrorBoundary caught]', error, info);
}
```

---

## ปัญหาที่ 4: Vite Cache ทำให้ browser โหลดโค้ดเก่า

### อาการ
หลัง downgrade package แล้ว browser ยังแสดง error เดิม  
ชื่อ chunk ยังเป็น `chunk-DBDASN2M.js?v=9471ee9e` (ชุดเก่า)

### สาเหตุ
Vite เก็บ dependency cache ไว้ที่ `node_modules/.vite/`  
เมื่อ install package ใหม่ Vite ไม่ได้ rebuild chunk โดยอัตโนมัติ  
browser ยังใช้ chunk เก่าจาก HTTP cache

### วิธีแก้
```bash
# 1. หยุด dev server
pkill -f "vite"

# 2. ลบ Vite cache
rm -rf node_modules/.vite

# 3. เริ่ม dev server ใหม่
npm run dev

# 4. ใน browser: Empty Cache and Hard Reload
# Chrome: F12 → คลิกขวาที่ปุ่ม reload → "Empty Cache and Hard Reload"
```

---

## ปัญหาที่ 5: ลบ import โดยไม่ตั้งใจ

### อาการ
```
Uncaught ReferenceError: useCallback is not defined
at FeaturesSection (Home.jsx:136)
```

### สาเหตุ
ระหว่างแก้ import ใน `Home.jsx` ลบ `useCallback` ออกจาก React import  
แต่ `FeaturesSection` ยังใช้ `useCallback` อยู่

```js
// ผิด
import { useEffect, useState, useRef } from 'react';

// ถูก
import { useEffect, useState, useRef, useCallback } from 'react';
```

### วิธีแก้
เพิ่ม `useCallback` กลับเข้า import

---

## สรุปการเปลี่ยนแปลงทั้งหมด

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `package.json` | downgrade R3F v9→v8, drei v10→v9 |
| `src/components/ErrorBoundary.jsx` | เพิ่ม `componentDidCatch` log error |
| `src/components/HeroCanvas2D.jsx` | **สร้างใหม่** — Canvas 2D particles + orbs |
| `src/components/three/HeroCanvas.jsx` | ไม่ถูกใช้แล้ว (WebGL ไม่ available) |
| `src/pages/Home.jsx` | เปลี่ยนจาก Three.js → HeroCanvas2D, เพิ่ม HeroBlobs CSS parallax |

---

## บทเรียน

1. **ตรวจ peer dependencies** ก่อน install — `@react-three/fiber@9` ระบุ `peerDependencies: { react: "^19" }` ชัดเจน
2. **ErrorBoundary ควร log เสมอ** แม้ fallback = null เพื่อให้ debug ได้
3. **WebGL อาจไม่ available** บน machine บางเครื่อง — ควรมี Canvas 2D fallback
4. **Clear Vite cache** ทุกครั้งที่เปลี่ยน dependencies หลัก
