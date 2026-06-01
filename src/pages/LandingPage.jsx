import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

const spSnappy = { type:'spring', stiffness:500, damping:30, mass:0.8 }
const spSmooth = { type:'spring', stiffness:280, damping:28, mass:1 }
const spBouncy = { type:'spring', stiffness:380, damping:18, mass:0.9 }

const Ico = {
  grad:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="7" r="3.5"/><path d="M2 19c0-4 2.5-6 6-6s6 2 6 6"/><circle cx="16.5" cy="8" r="2.5"/><path d="M14 19c0-2.5 1.5-4 4-4s4 1.5 4 4"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3L4 6.5v5c0 4 3.5 7.5 8 8.5 4.5-1 8-4.5 8-8.5v-5L12 3z"/><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bolt:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6"/><path d="M15.5 15.5L20 20" strokeLinecap="round"/></svg>,
  bell:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  lock:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round"/></svg>,
  arrow:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M14 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pdf:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  layers: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  crown:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17L6 7l6 5 6-5 3 10H3z"/><path d="M3 17h18" strokeLinecap="round"/></svg>,
  chart:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  sun:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  moon:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function Counter({ to, prefix='', suffix='' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-80px' })
  useEffect(() => {
    if (!inView) return
    let raf, start
    const run = ts => {
      if (!start) start = ts
      const prog = Math.min((ts - start) / 1400, 1)
      const ease = 1 - Math.pow(1 - prog, 3)
      setVal(Math.round(ease * to))
      if (prog < 1) raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])
  return <span ref={ref}>{prefix}{val}{suffix}</span>
}

function Orbs() {
  const orbList = [
    { cx:'8%',  cy:'15%', sz:500, c1:'#4f46e5', c2:'#7c3aed', dur:9,  d:0   },
    { cx:'88%', cy:'10%', sz:400, c1:'#0ea5e9', c2:'#6366f1', dur:11, d:1.5 },
    { cx:'75%', cy:'82%', sz:450, c1:'#8b5cf6', c2:'#ec4899', dur:10, d:0.8 },
    { cx:'5%',  cy:'78%', sz:300, c1:'#06b6d4', c2:'#3b82f6', dur:12, d:2   },
    { cx:'50%', cy:'50%', sz:600, c1:'#4f46e5', c2:'#0ea5e9', dur:15, d:0   },
  ]
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {orbList.map((o, i) => (
        <motion.div key={i}
          animate={{ x:[0,25,-18,8,0], y:[0,-22,16,-8,0], scale:[1,1.06,0.97,1.03,1] }}
          transition={{ duration:o.dur, delay:o.d, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', left:o.cx, top:o.cy, width:o.sz, height:o.sz, transform:'translate(-50%,-50%)', borderRadius:'50%', background:`radial-gradient(circle at 35% 35%, ${o.c1}18, ${o.c2}08, transparent 65%)`, filter:'blur(60px)' }}/>
      ))}
    </div>
  )
}

function Reveal({ children, delay=0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, y:36 }}
      animate={inView ? { opacity:1, y:0, transition:{ ...spSmooth, delay } } : {}}>
      {children}
    </motion.div>
  )
}

function FeatureCard({ icon, title, desc, accent, delay }) {
  return (
    <Reveal delay={delay}>
      <motion.div whileHover={{ y:-8, scale:1.02, transition:spSnappy }} whileTap={{ scale:0.98 }}
        style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:20, padding:'28px 24px', boxShadow:'var(--shadow-sm)', height:'100%' }}>
        <motion.div whileHover={{ scale:1.12, rotate:8, transition:spBouncy }}
          style={{ width:50, height:50, borderRadius:15, background:`linear-gradient(135deg, ${accent}25, ${accent}10)`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center', color:accent, marginBottom:18, boxShadow:`0 8px 32px ${accent}15` }}>
          {icon}
        </motion.div>
        <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:10, fontFamily:'Outfit,sans-serif', letterSpacing:'-0.3px' }}>{title}</h3>
        <p style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.7, fontFamily:'Outfit,sans-serif' }}>{desc}</p>
      </motion.div>
    </Reveal>
  )
}

function Step({ num, title, desc, delay, accent }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-40px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, x:-32 }}
      animate={inView ? { opacity:1, x:0, transition:{ ...spSmooth, delay } } : {}}
      style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
      <motion.div whileHover={{ scale:1.1, rotate:5, transition:spBouncy }}
        style={{ width:52, height:52, borderRadius:16, flexShrink:0, background:`linear-gradient(135deg, ${accent}, ${accent}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Outfit,sans-serif', fontWeight:900, fontSize:18, color:'#fff', boxShadow:`0 8px 24px ${accent}30` }}>
        {num}
      </motion.div>
      <div>
        <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:6, fontFamily:'Outfit,sans-serif' }}>{title}</h3>
        <p style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.7, fontFamily:'Outfit,sans-serif' }}>{desc}</p>
      </div>
    </motion.div>
  )
}

function MockUI() {
  const mockCards = [
    { name:'OOP Study Group', dept:'SE', members:4, max:5, status:'open',   color:'#f97316' },
    { name:'DSA Prep Team',   dept:'SE', members:5, max:5, status:'locked', color:'#f97316' },
    { name:'DBMS Project',    dept:'CS', members:3, max:6, status:'open',   color:'#06b6d4' },
    { name:'Web Dev Squad',   dept:'CS', members:6, max:6, status:'locked', color:'#06b6d4' },
  ]
  return (
    <motion.div initial={{ opacity:0, y:48, scale:0.94 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ ...spSmooth, delay:0.5 }}
      style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:24, padding:20, boxShadow:'var(--shadow-lg)', width:'100%', maxWidth:360 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, paddingBottom:12, borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center' }}>{Ico.grad}</div>
          <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>UniGroups</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['#ff5f57','#febc2e','#28c840'].map((col,i) => <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:col }}/>)}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {mockCards.map((card, i) => (
          <motion.div key={i}
            initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ ...spSmooth, delay: 0.7 + i * 0.1 }}
            whileHover={{ x:4, scale:1.01, transition:spSnappy }}
            style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', borderLeft:`3px solid ${card.color}`, borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)', fontFamily:'Outfit,sans-serif', marginBottom:2 }}>{card.name}</p>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:10, color:card.color, fontWeight:600, fontFamily:'Outfit,sans-serif' }}>{card.dept}</span>
                <span style={{ fontSize:10, color:'var(--text-muted)' }}>·</span>
                <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'Outfit,sans-serif' }}>{card.members}/{card.max}</span>
              </div>
            </div>
            <span style={{ fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:6, background: card.status==='open' ? 'rgba(74,222,128,0.1)' : 'rgba(148,163,184,0.1)', color: card.status==='open' ? '#4ade80' : '#64748b', border: `1px solid ${card.status==='open' ? 'rgba(74,222,128,0.2)' : 'rgba(148,163,184,0.15)'}`, fontFamily:'Outfit,sans-serif', textTransform:'uppercase', letterSpacing:'0.5px' }}>
              {card.status}
            </span>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
        style={{ display:'flex', gap:8, marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
        {[{lbl:'Groups',vl:'4'},{lbl:'Members',vl:'18'},{lbl:'Depts',vl:'2'}].map(({lbl,vl})=>(
          <div key={lbl} style={{ flex:1, textAlign:'center', padding:'8px 4px', background:'var(--bg-raised)', borderRadius:8 }}>
            <p style={{ fontSize:16, fontWeight:800, color:'#6366f1', fontFamily:'Outfit,sans-serif', lineHeight:1 }}>{vl}</p>
            <p style={{ fontSize:9, color:'var(--text-muted)', fontFamily:'Outfit,sans-serif', marginTop:2 }}>{lbl}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage({ onEnter }) {
  const { dark, toggleDark } = useApp()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { icon:Ico.grad,   title:'Roll Number Login',        desc:'Register with your university roll number. Email OTP verification keeps the platform secure and student-only.', accent:'#6366f1', delay:0 },
    { icon:Ico.users,  title:'Department Groups',         desc:'Browse groups in your department — SE or CS. Your department groups always appear first for quick access.', accent:'#0ea5e9', delay:0.07 },
    { icon:Ico.search, title:'Browse & Join',             desc:'Find open groups, send join requests, and get accepted by the leader. Full request management system built in.', accent:'#8b5cf6', delay:0.14 },
    { icon:Ico.crown,  title:'Leader Controls',           desc:'Group creators become leaders. Leaders manage members, accept/reject requests, and lock groups when full.', accent:'#f59e0b', delay:0.21 },
    { icon:Ico.bell,   title:'Real-time Notifications',   desc:'Get notified when your request is accepted, rejected, or when group status changes. Never miss an update.', accent:'#10b981', delay:0.28 },
    { icon:Ico.shield, title:'Admin Panel',               desc:'Admins manage all students and departments with full oversight, role management, and one-click admin elevation.', accent:'#ef4444', delay:0.35 },
    { icon:Ico.pdf,    title:'PDF Export',                desc:'Admins select any groups and export a professional PDF report with member lists, roles, and department info.', accent:'#f97316', delay:0.42 },
    { icon:Ico.lock,   title:'Group Locking',             desc:'Groups auto-lock when full. Leaders can manually lock/unlock. Locked groups are clearly visible to all students.', accent:'#06b6d4', delay:0.49 },
    { icon:Ico.chart,  title:'Department Stats',          desc:'Visual progress bars, member counts, and department-wise overviews help everyone understand group capacity.', accent:'#a855f7', delay:0.56 },
  ]

  const statsList = [
    { num:2,   sfx:'',  lbl:'Departments',  pref:'' },
    { num:20,  sfx:'+', lbl:'Max Per Group', pref:'' },
    { num:100, sfx:'%', lbl:'Free Forever',  pref:'' },
    { num:99,  sfx:'%', lbl:'Uptime',        pref:'' },
  ]

  const stepsList = [
    { num:1, title:'Register with Roll Number',   desc:'Sign up using your university roll number. Verify your email via OTP and your account is instantly active.', accent:'#6366f1' },
    { num:2, title:'Browse Department Groups',    desc:'Explore all open groups in your department. See member counts, leader info, and descriptions before joining.', accent:'#8b5cf6' },
    { num:3, title:'Join or Create a Group',      desc:'Send a join request to open groups or create your own. Set name, description, and max member count your way.', accent:'#a855f7' },
    { num:4, title:'Collaborate with Classmates', desc:'Once in a group, coordinate with members, manage requests as leader, and use notifications to stay updated.', accent:'#c084fc' },
  ]

  return (
    <div style={{ background:'var(--bg-base)', minHeight:'100vh', color:'var(--text-primary)', overflowX:'hidden', position:'relative', transition:'background 0.3s, color 0.3s' }}>
      {/* Noise */}
      <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', opacity:0.02, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}/>

      {/* Nav */}
      <motion.nav style={{ 
        position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'0 24px', height:64, 
        display:'flex', alignItems:'center', justifyContent:'space-between', 
        background: scrolled ? 'var(--bg-surface)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition:'background 0.3s, border 0.3s, backdrop-filter 0.3s'
      }}>
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ ...spSmooth, delay:0.1 }} style={{ display:'flex', alignItems:'center', gap:10 }}>
          <motion.div whileHover={{ scale:1.08, rotate:5 }} transition={spBouncy}
            style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(99,102,241,0.4)' }}>
            {Ico.grad}
          </motion.div>
          <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:17, letterSpacing:'-0.3px' }}>UniGroups</span>
        </motion.div>
        
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {/* Theme Toggle Button */}
          <motion.button 
            whileHover={{ scale:1.06, background:'var(--bg-hover)' }} 
            whileTap={{ scale:0.95 }} 
            onClick={toggleDark}
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{ 
              width:38, 
              height:38, 
              borderRadius:12, 
              border:'1px solid var(--border)', 
              background:'var(--bg-surface)', 
              color:'var(--text-primary)', 
              cursor:'pointer', 
              display:'flex', 
              alignItems:'center', 
              justifyContent:'center',
              boxShadow:'var(--shadow-sm)',
              transition:'background 0.2s, border 0.2s, color 0.2s'
            }}
          >
            {dark ? Ico.sun : Ico.moon}
          </motion.button>

          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }} onClick={onEnter}
            initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ ...spSmooth, delay:0.15 }}
            style={{ padding:'9px 22px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:12, fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'Outfit,sans-serif', boxShadow:'0 4px 20px rgba(99,102,241,0.35)', display:'flex', alignItems:'center', gap:6 }}>
            Get Started {Ico.arrow}
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <div style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', overflow:'hidden' }}>
        <Orbs/>
        <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage: dark ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)' : 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'100px 24px 60px', width:'100%', position:'relative', zIndex:2 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }} className="hero-grid">
            <div>
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ ...spSmooth, delay:0.1 }}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:100, marginBottom:24 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#6366f1', display:'inline-block', boxShadow:'0 0 8px #6366f1' }}/>
                <span style={{ fontSize:12, fontWeight:600, color:'#818cf8', fontFamily:'Outfit,sans-serif', letterSpacing:'0.05em' }}>Superior University · GMS</span>
              </motion.div>
              <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ ...spSmooth, delay:0.2 }}
                style={{ fontSize:'clamp(36px,5vw,62px)', fontWeight:900, lineHeight:1.08, letterSpacing:'-2px', marginBottom:20, fontFamily:'Outfit,sans-serif' }}>
                Find your<br/>
                <span style={{ background:'linear-gradient(135deg,#6366f1,#a78bfa,#38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>study group</span><br/>
                in seconds.
              </motion.h1>
              <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ ...spSmooth, delay:0.3 }}
                style={{ fontSize:17, color:'var(--text-secondary)', lineHeight:1.7, marginBottom:36, maxWidth:460, fontFamily:'Outfit,sans-serif' }}>
                UniGroups is the group management platform built for Superior University students. Create, join, and manage study groups with your classmates — all in one place.
              </motion.p>
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ ...spSmooth, delay:0.4 }}
                style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:36 }}>
                <motion.button whileHover={{ scale:1.04, boxShadow:'0 16px 48px rgba(99,102,241,0.45)' }} whileTap={{ scale:0.97 }} onClick={onEnter}
                  style={{ padding:'14px 32px', minWidth:210, justifyContent:'center', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:14, fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'Outfit,sans-serif', boxShadow:'0 8px 32px rgba(99,102,241,0.35)', display:'flex', alignItems:'center', gap:8 }}>
                  Get Started Free {Ico.arrow}
                </motion.button>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior:'smooth' })}
                  style={{ padding:'14px 32px', minWidth:210, display:'inline-flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'1px solid var(--border)', borderRadius:14, fontSize:15, fontWeight:600, color:'var(--text-secondary)', cursor:'pointer', fontFamily:'Outfit,sans-serif' }}>
                  See Features
                </motion.button>
              </motion.div>
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }} style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                {['Free for all students','Instant access'].map((txt,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12.5, color:'var(--text-muted)', fontFamily:'Outfit,sans-serif' }}>
                    <span style={{ color:'#4ade80', display:'flex' }}>{Ico.check}</span>{txt}
                  </div>
                ))}
              </motion.div>
            </div>
            <div style={{ display:'flex', justifyContent:'center' }}><MockUI/></div>
          </div>
        </div>
        <motion.div animate={{ y:[0,10,0] }} transition={{ repeat:Infinity, duration:2 }}
          style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:2 }}>
          <div style={{ width:24, height:38, border:'2px solid var(--border)', borderRadius:12, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:4 }}>
            <motion.div animate={{ y:[0,12,0] }} transition={{ repeat:Infinity, duration:1.5 }} style={{ width:4, height:8, background:'var(--text-muted)', borderRadius:2 }}/>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div style={{ padding:'60px 24px', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }} className="stats-grid">
          {statsList.map(({ num, sfx, lbl, pref }, i) => (
            <Reveal key={lbl} delay={i * 0.08}>
              <div style={{ textAlign:'center', padding:'28px 16px', borderRadius:20, background:'var(--bg-raised)', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ fontSize:44, fontWeight:900, fontFamily:'Outfit,sans-serif', background:'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1 }}>
                  <Counter to={num} prefix={pref} suffix={sfx}/>
                </div>
                <p style={{ fontSize:12.5, color:'var(--text-secondary)', marginTop:8, fontFamily:'Outfit,sans-serif', fontWeight:500 }}>{lbl}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ maxWidth:1100, margin:'0 auto', padding:'90px 24px' }}>
        <Reveal>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.12em', fontFamily:'Outfit,sans-serif' }}>Everything You Need</span>
            <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, marginTop:12, letterSpacing:'-1.5px', fontFamily:'Outfit,sans-serif', lineHeight:1.1 }}>
              Built for students,<br/><span style={{ color:'var(--text-secondary)' }}>by Superior University.</span>
            </h2>
            <p style={{ fontSize:16, color:'var(--text-muted)', marginTop:14, maxWidth:480, margin:'14px auto 0', fontFamily:'Outfit,sans-serif', lineHeight:1.65 }}>Every feature designed around how university students actually collaborate</p>
          </div>
        </Reveal>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="features-grid">
          {features.map((feat, i) => <FeatureCard key={i} {...feat}/>)}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding:'80px 24px', background:'var(--bg-raised)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#8b5cf6', textTransform:'uppercase', letterSpacing:'0.12em', fontFamily:'Outfit,sans-serif' }}>How It Works</span>
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:900, marginTop:12, letterSpacing:'-1px', fontFamily:'Outfit,sans-serif' }}>Up and running in 4 steps</h2>
            </div>
          </Reveal>
          <div style={{ display:'flex', flexDirection:'column', gap:36 }}>
            {stepsList.map((st, i) => <Step key={i} {...st} delay={i * 0.1}/>)}
          </div>
        </div>
      </div>

      {/* Departments */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'80px 24px' }}>
        <Reveal>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#0ea5e9', textTransform:'uppercase', letterSpacing:'0.12em', fontFamily:'Outfit,sans-serif' }}>Departments</span>
            <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:900, marginTop:12, letterSpacing:'-1px', fontFamily:'Outfit,sans-serif' }}>Two departments, one platform</h2>
          </div>
        </Reveal>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }} className="dept-grid">
          {[
            { dept:'SE', lbl:'Software Engineering', col:'#f97316', desc:'Build project groups, form study teams, collaborate on assignments — all within your SE cohort.', icon:Ico.layers },
            { dept:'CS', lbl:'Computer Science',     col:'#06b6d4', desc:'Find lab partners, create revision groups, share resources with your CS classmates easily.', icon:Ico.bolt },
          ].map(({ dept, lbl, col, desc, icon }) => (
            <Reveal key={dept}>
              <motion.div whileHover={{ y:-6, scale:1.01, transition:spSnappy }}
                style={{ padding:32, borderRadius:24, background: dark ? `linear-gradient(135deg, ${col}08, transparent)` : `linear-gradient(135deg, ${col}05, var(--bg-surface))`, border:`1px solid ${col}30`, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-20, right:-20, width:120, height:120, borderRadius:'50%', background:`radial-gradient(circle, ${col}15, transparent 70%)` }}/>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${col}18`, border:`1px solid ${col}25`, display:'flex', alignItems:'center', justifyContent:'center', color:col }}>{icon}</div>
                  <div>
                    <p style={{ fontSize:22, fontWeight:900, fontFamily:'Outfit,sans-serif', color:col }}>{dept}</p>
                    <p style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'Outfit,sans-serif' }}>{lbl}</p>
                  </div>
                </div>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.7, fontFamily:'Outfit,sans-serif' }}>{desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:'100px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <Orbs/>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.08), transparent)', pointerEvents:'none' }}/>
        <Reveal>
          <div style={{ position:'relative', zIndex:1 }}>
            <motion.div animate={{ rotate:[0,360] }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
              style={{ width:60, height:60, borderRadius:18, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 12px 40px rgba(99,102,241,0.4)' }}>
              {Ico.grad}
            </motion.div>
            <h2 style={{ fontSize:'clamp(30px,5vw,56px)', fontWeight:900, letterSpacing:'-2px', marginBottom:16, fontFamily:'Outfit,sans-serif', lineHeight:1.1 }}>
              Ready to find your<br/>
              <span style={{ background:'linear-gradient(135deg,#6366f1,#a78bfa,#38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>study group?</span>
            </h2>
            <p style={{ fontSize:16, color:'var(--text-secondary)', marginBottom:40, fontFamily:'Outfit,sans-serif', maxWidth:400, margin:'0 auto 40px' }}>
              Join Superior University students already using UniGroups to collaborate smarter.
            </p>
            <motion.button whileHover={{ scale:1.06, boxShadow:'0 20px 60px rgba(99,102,241,0.5)' }} whileTap={{ scale:0.97 }} onClick={onEnter}
              style={{ padding:'16px 48px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:16, fontSize:16, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'Outfit,sans-serif', boxShadow:'0 8px 32px rgba(99,102,241,0.35)', display:'inline-flex', alignItems:'center', gap:10 }}>
              {Ico.grad} Get Started — It's Free
            </motion.button>
          </div>
        </Reveal>
      </div>

      {/* Footer */}
      <div style={{ padding:'28px 24px', borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center' }}>{Ico.grad}</div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:14, color:'var(--text-secondary)' }}>UniGroups</span>
          </div>
          <p style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'Outfit,sans-serif' }}>© 2025 UniGroups — Superior University Group Management System</p>
          <div style={{ display:'flex', gap:16 }}>
            {['Features','How It Works','Get Started'].map(txt => (
              <span key={txt} onClick={txt==='Get Started' ? onEnter : undefined}
                style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'Outfit,sans-serif', cursor:'pointer' }}>{txt}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        @media (max-width:768px) {
          .hero-grid { grid-template-columns:1fr !important; }
          .features-grid { grid-template-columns:1fr !important; }
          .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .dept-grid { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  )
}
