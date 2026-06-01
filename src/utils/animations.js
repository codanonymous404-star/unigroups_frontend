// ── Spring configs ───────────────────────────────────────────
export const springSnappy  = { type:'spring', stiffness:500, damping:30,  mass:0.8 }
export const springSmooth  = { type:'spring', stiffness:300, damping:28,  mass:1   }
export const springBouncy  = { type:'spring', stiffness:400, damping:20,  mass:0.9 }
export const springGentle  = { type:'spring', stiffness:200, damping:25,  mass:1.2 }
export const springInstant = { type:'spring', stiffness:700, damping:40,  mass:0.6 }

// Grouped for convenience
export const spring = {
  snappy:  springSnappy,
  smooth:  springSmooth,
  bouncy:  springBouncy,
  gentle:  springGentle,
  instant: springInstant,
}

// ── Page transition ──────────────────────────────────────────
export const pageVariants = {
  initial:  { opacity:0, y:16, scale:0.99 },
  animate:  { opacity:1, y:0,  scale:1,   transition:{ ...springSmooth, staggerChildren:0.06 } },
  exit:     { opacity:0, y:-8, scale:0.99, transition:{ duration:0.15 } },
}

// ── Stagger container ────────────────────────────────────────
export const staggerContainer = {
  initial:  {},
  animate:  { transition: { staggerChildren:0.07, delayChildren:0.05 } },
}

// ── Fade up ──────────────────────────────────────────────────
export const fadeUp = {
  initial:  { opacity:0, y:20 },
  animate:  { opacity:1, y:0,  transition: springSmooth },
  exit:     { opacity:0, y:-10, transition:{ duration:0.15 } },
}

// ── Scale in ────────────────────────────────────────────────
export const scaleIn = {
  initial:  { opacity:0, scale:0.92 },
  animate:  { opacity:1, scale:1,   transition: springBouncy },
  exit:     { opacity:0, scale:0.95, transition:{ duration:0.12 } },
}

// ── Slide in from left ───────────────────────────────────────
export const slideLeft = {
  initial:  { x:-24, opacity:0 },
  animate:  { x:0,   opacity:1, transition: springSmooth },
  exit:     { x:-16, opacity:0, transition:{ duration:0.15 } },
}

// ── Dropdown ─────────────────────────────────────────────────
export const dropDown = {
  initial:  { opacity:0, scale:0.95, y:-8 },
  animate:  { opacity:1, scale:1,    y:0,  transition: springSnappy },
  exit:     { opacity:0, scale:0.95, y:-8, transition:{ duration:0.12 } },
}

// ── Card interactions ────────────────────────────────────────
export const cardHover = {
  scale: 1.02,
  y: -3,
  transition: springSnappy,
}
export const cardTap = {
  scale: 0.97,
  transition: springInstant,
}

// ── Button interactions ──────────────────────────────────────
export const buttonTap   = { scale:0.94, transition: springInstant }
export const buttonHover = { scale:1.03, transition: springSnappy  }
