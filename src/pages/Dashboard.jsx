import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import Icon from '../components/ui/Icons.jsx'
import { useEffect, useState } from 'react'
import { useAuth }   from '../context/AuthContext.jsx'
import { useApp }    from '../context/AppContext.jsx'
import { groupsAPI } from '../api/groups.js'
import GroupCard     from '../components/cards/GroupCard.jsx'
import Button        from '../components/ui/Button.jsx'
import Badge         from '../components/ui/Badge.jsx'
import { Skeleton, EmptyState } from '../components/ui/misc.jsx'
import { fadeUp, staggerContainer, springSmooth, springSnappy } from '../utils/animations.js'

const DEPT = {
  SE: { label: 'Software Engineering', bar: 'bg-orange-400', badge: 'se', color: 'text-orange-500 dark:text-orange-400', glow: 'rgba(249,115,22,0.06)' },
  CS: { label: 'Computer Science',     bar: 'bg-cyan-400',   badge: 'cs', color: 'text-cyan-500 dark:text-cyan-400',     glow: 'rgba(6,182,212,0.06)'  },
}

function StatBox({ label, value, icon }) {
  return (
    <div className="neu-stat-box">
      <div className="flex flex-col">
        <span className="neu-stat-label">{label}</span>
        <span className="neu-stat-value">{value}</span>
      </div>
      <div className="text-[var(--text-muted)] opacity-80">
        <Icon name={icon} size={16} />
      </div>
    </div>
  )
}

// ── QuickActionCard (Neumorphic Card Button) ───────────────────────────────────
function QuickActionCard({ a, navigate }) {
  return (
    <button
      onClick={() => navigate(a.page)}
      className={`neu-item-btn ${a.colorClass}`}
    >
      <Icon name={a.icon} size={15} />
      <span>{a.label}</span>
    </button>
  )
}



// ── Interactive Subject Wallet Card ───────────────────────────────────────────
function SubjectWallet({ subject, navigate, membersMap, deptKey, index: walletIndex, activeWalletId, setActiveWalletId }) {
  const groups = subject.groups || []
  const [hovered, setHovered] = useState(false)
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null)

  const walletId = subject.id || `wallet-${walletIndex}-${deptKey}`;
  const isOpen = activeWalletId === walletId;
  const isFanned = hovered || isOpen;

  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setHovered(true);
    }
  };

  const toggleOpen = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setActiveWalletId(null);
    } else {
      setActiveWalletId(walletId);
    }
  };
  
  // Modulo generator for 16+ colorful premium card gradients matching SE and CS
  const getCardGradient = (index) => {
    const gradients = deptKey === 'SE' 
      ? [
          'linear-gradient(135deg, #f97316, #ea580c)', // Orange Red
          'linear-gradient(135deg, #f59e0b, #d97706)', // Amber Gold
          'linear-gradient(135deg, #ef4444, #b91c1c)', // Red Ruby
          'linear-gradient(135deg, #ec4899, #be185d)', // Pink Rose
          'linear-gradient(135deg, #8b5cf6, #6d28d9)', // Purple Violet
          'linear-gradient(135deg, #e11d48, #9f1239)', // Rose Crimson
          'linear-gradient(135deg, #f97316, #b45309)', // Bright Amber
          'linear-gradient(135deg, #f43f5e, #be123c)', // Coral Sunset
          'linear-gradient(135deg, #d946ef, #a21caf)', // Fuchsia Magenta
          'linear-gradient(135deg, #ff7e5f, #feb47b)', // Pastel Coral
          'linear-gradient(135deg, #ff9966, #ff5e62)', // Peach Passion
          'linear-gradient(135deg, #e52d27, #b31217)', // Crimson Fire
          'linear-gradient(135deg, #f12711, #f5af19)', // Sunburst Gold
          'linear-gradient(135deg, #ff0844, #ffb199)', // Velvet Red
          'linear-gradient(135deg, #f857a6, #ff5858)', // Candy Salmon
          'linear-gradient(135deg, #ff4e50, #f9d423)'  // Sherbet Sun
        ]
      : [
          'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan Teal
          'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Deep Cobalt
          'linear-gradient(135deg, #10b981, #047857)', // Emerald Wave
          'linear-gradient(135deg, #6366f1, #4338ca)', // Indigo Royal
          'linear-gradient(135deg, #14b8a6, #0f766e)', // Teal Sea
          'linear-gradient(135deg, #3a7bd5, #3a6073)', // Steel Slate
          'linear-gradient(135deg, #00c6ff, #0072ff)', // Neon Electric
          'linear-gradient(135deg, #02aab0, #00cdac)', // Mint Breeze
          'linear-gradient(135deg, #4facfe, #00f2fe)', // Sky Lagoon
          'linear-gradient(135deg, #43e97b, #38f9d7)', // Lime Cyan
          'linear-gradient(135deg, #1e3c72, #2a5298)', // Navy Steel
          'linear-gradient(135deg, #2b5876, #4e4376)', // Charcoal Violet
          'linear-gradient(135deg, #11998e, #38ef7d)', // Aurora Green
          'linear-gradient(135deg, #0575e6, #00f260)', // Cyber Lime Blue
          'linear-gradient(135deg, #182848, #4b6cb7)', // Deep Space Navy
          'linear-gradient(135deg, #2193b0, #6dd5ed)'  // Ice Blue Cyan
        ];
    return gradients[index % gradients.length];
  };

  const getPocketStyle = (index) => {
    const seStyles = [
      { fill: '#431407', stroke: '#f97316' }, // Rust / Orange
      { fill: '#3f0712', stroke: '#ef4444' }, // Burgundy / Red
      { fill: '#2d0b30', stroke: '#d946ef' }, // Purple / Magenta
      { fill: '#581c87', stroke: '#a855f7' }, // Violet / Lavender
      { fill: '#701a75', stroke: '#f472b6' }, // Dark Rose / Pink
      { fill: '#881337', stroke: '#fb7185' }, // Wine / Rose
      { fill: '#7c2d12', stroke: '#f97316' }, // Terracotta / Coral
      { fill: '#78350f', stroke: '#f59e0b' }, // Dark Amber / Gold
      { fill: '#451a03', stroke: '#fb923c' }, // Espresso / Peach
      { fill: '#4c0519', stroke: '#f43f5e' }, // Crimson / Strawberry
      { fill: '#3b0764', stroke: '#c084fc' }, // Royal / Grape
      { fill: '#1e1b4b', stroke: '#818cf8' }, // Indigo / Blue
      { fill: '#50074f', stroke: '#e879f9' }, // Plum / Pink Orchid
      { fill: '#311042', stroke: '#c084fc' }, // Mulberry / Lavender
      { fill: '#991b1b', stroke: '#ef4444' }, // Crimson / Fire
      { fill: '#621a55', stroke: '#f472b6' }  // Jam / Mauve
    ];
    
    const csStyles = [
      { fill: '#0f172a', stroke: '#38bdf8' }, // Midnight Slate / Sky
      { fill: '#042f2e', stroke: '#2dd4bf' }, // Deep Teal / Mint
      { fill: '#064e3b', stroke: '#34d399' }, // Forest Green / Emerald
      { fill: '#172554', stroke: '#60a5fa' }, // Deep Ocean / Blue
      { fill: '#164e63', stroke: '#22d3ee' }, // Dark Cyan / Aqua
      { fill: '#0c4a6e', stroke: '#38bdf8' }, // Sky Deep / Cyan
      { fill: '#022c22', stroke: '#10b981' }, // Midnight Mint / Green
      { fill: '#1e1b4b', stroke: '#818cf8' }, // Royal Navy / Indigo
      { fill: '#075985', stroke: '#0ea5e9' }, // Deep Aqua / Sky
      { fill: '#065f46', stroke: '#10b981' }, // Pine Green / Mint
      { fill: '#0f766e', stroke: '#14b8a6' }, // Ocean Deep / Teal
      { fill: '#1e3a8a', stroke: '#3b82f6' }, // Cobalt Navy / Blue
      { fill: '#0369a1', stroke: '#06b6d4' }, // Steel Blue / Cyan
      { fill: '#083344', stroke: '#22d3ee' }, // Deep Cyan / Teal
      { fill: '#111827', stroke: '#9ca3af' }, // Onyx / Slate
      { fill: '#0f172a', stroke: '#818cf8' }  // Dark Slate / Lavender
    ];

    const list = deptKey === 'SE' ? seStyles : csStyles;
    return list[index % list.length];
  };

  const pocketStyle = getPocketStyle(walletIndex);
  const pocketColor = pocketStyle.fill;
  const pocketStroke = pocketStyle.stroke;

  return (
    <div 
      className="subject-wallet group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { setHovered(false); setHoveredCardIndex(null); }}
    >
      {/* Wallet back panel */}
      <div className="wallet-back-panel" />
      
      {/* Dynamic Group cards - renders all groups fanned out dynamically */}
      {groups.map((g, index) => {
        const groupMembers = membersMap[g.id] || [];
        const mc = groupMembers.length || g.member_count || 0;
        const max = g.max_members || 5;
        
        const total = groups.length;
        
        // Invert slot index so Group 1 (index 0) sits at the very front
        const slotIndex = total - 1 - index;
        const zIndex = (isFanned && hoveredCardIndex === index) ? 100 : (10 + slotIndex);
        
        // 1. Initial stacked layout bottom positioning (responsive to prevent overflow when closed)
        const isMobile = window.innerWidth < 640;
        const baseBottom = isMobile ? 12 : 35;
        const maxStep = isMobile ? 10 : 22;
        const step = total > 1 ? Math.min(maxStep, (isMobile ? 25 : 55) / (total - 1)) : 0;
        const initialBottom = baseBottom + index * step;
        
        // 2. Staggered dynamic fan values on hover
        let ty = 0;
        let tx = 0;
        let rot = 0;
        
        if (total === 1) {
          ty = -90; // single card slides out fully to be visible
        } else {
          // Map vertical slides: Group 1 (front) goes to -10px, back-most goes to -135px for more space
          const minY = -135;
          const maxY = -10;
          ty = minY + (slotIndex / (total - 1)) * (maxY - minY);
          
          // Map rotation and horizontal fanning out
          const maxAngle = Math.min(12, 36 / (total - 1));
          const maxX = Math.min(65, 130 / (total - 1)); // Increased from 45/95 to 65/130 for more click space
          const factor = (slotIndex / (total - 1)) * 2 - 1; // goes from -1 to 1
          
          rot = factor * maxAngle;
          tx = factor * maxX;
        }
        
        // Expand individual card higher on mouse focus / tap highlight
        let scale = 1;
        if (hoveredCardIndex === index) {
          scale = 1.05;
          ty -= 18;
        }
        
        return (
          <div
            key={g.id}
            onMouseEnter={() => setHoveredCardIndex(index)}
            onMouseLeave={() => setHoveredCardIndex(null)}
            onTouchStart={(e) => {
              e.stopPropagation();
              setHoveredCardIndex(index);
            }}
            className="wallet-group-card"
            style={{ 
              zIndex,
              background: getCardGradient(index),
              bottom: initialBottom,
              transform: isFanned
                ? `translateY(${ty}px) translateX(${tx}px) rotate(${rot}deg) scale(${scale})`
                : 'translateY(0) translateX(0) rotate(0) scale(1)',
              transition: 'transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1), z-index 0.1s ease',
            }}
          >
            <div className="card-inner flex flex-col justify-between h-full w-full">
              <div className="card-top flex items-center justify-between gap-1 w-full">
                <span className="font-bold tracking-wider text-[10px] sm:text-xs truncate max-w-[75%]">{g.name}</span>
                <div className="chip flex items-center justify-center bg-white/20 p-1 rounded-full w-5 h-5 flex-shrink-0">
                  <Icon name={g.status === 'open' ? 'unlock' : 'lock'} size={11} className="text-white/95" />
                </div>
              </div>
              
              {/* Member names list - showing all members without slice */}
              <div className="my-1 flex flex-wrap gap-1 items-center max-h-[38px] overflow-hidden w-full">
                {groupMembers.map((m, i) => {
                  const u = m.user || m;
                  return (
                    <span key={u?.id || i} className="text-[8px] font-semibold px-1 py-0.5 rounded bg-white/25 text-white truncate max-w-[70px]">
                      {u?.name?.split(' ')[0]}
                    </span>
                  )
                })}
              </div>

              <div className="card-bottom flex items-end justify-between w-full mt-auto">
                <div className="card-info flex flex-col items-start">
                  <span className="label text-[8px] opacity-75 uppercase tracking-wide">Members</span>
                  <span className="value font-bold text-white text-[10px] sm:text-xs">{mc} / {max}</span>
                </div>
                <div className="card-number-wrapper flex flex-col items-end">
                  <span className="label text-[8px] opacity-75 uppercase tracking-wide">{g.my_role ? 'Role' : 'Status'}</span>
                  <span className="value font-mono text-[9px] sm:text-[10px] uppercase font-bold text-white">
                    {g.my_role || g.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Pocket */}
      <div className="wallet-pocket cursor-pointer" onClick={() => navigate('browse-groups')}>
        <svg className="wallet-pocket-bg" viewBox="0 0 290 160" fill="none">
          <path
            d="M 0 20 C 0 10, 5 10, 10 10 C 20 10, 25 25, 40 25 L 250 25 C 265 25, 270 10, 280 10 C 285 10, 290 10, 290 20 L 290 120 C 290 155, 270 160, 250 160 L 40 160 C 20 160, 0 155, 0 120 Z"
            fill={pocketColor}
          />
          <path
            d="M 8 22 C 8 16, 12 16, 15 16 C 23 16, 27 29, 40 29 L 250 29 C 263 29, 267 16, 275 16 C 278 16, 282 16, 282 22 L 282 120 C 282 150, 265 152, 250 152 L 40 152 C 25 152, 8 152, 8 120 Z"
            stroke={pocketStroke}
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        </svg>
        <div className="pocket-content-overlay flex flex-col items-center justify-center gap-1">
          <p 
            className="pocket-title font-bold text-white text-center px-2"
            style={{
              fontSize: subject.name.length > 25 ? '9px' : subject.name.length > 15 ? '11px' : '13px',
              lineHeight: '1.25',
              fontFamily: 'Outfit, sans-serif',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            title={subject.name}
          >
            {subject.name}
          </p>
          <span className="pocket-subtitle font-semibold">
            {groups.length} Group{groups.length !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={toggleOpen}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 hover:bg-white/35 border-0 text-white cursor-pointer transition-all duration-200 mt-1"
            style={{ pointerEvents: 'auto' }}
            title={isOpen ? "Collapse groups" : "Expand groups"}
          >
            <Icon 
              name="chevronUp" 
              size={13} 
              className="text-white transition-transform duration-300"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Subject section inside a dept ────────────────────────────────────────────
const PREVIEW = 2

function SubjectSection({ subject, navigate, membersMap, deptKey }) {
  const [open,     setOpen]     = useState(true)
  const [expanded, setExpanded] = useState(false)
  const cfg    = DEPT[deptKey]
  const groups = subject.groups || []
  const total  = groups.length
  const visible = expanded ? groups : groups.slice(0, PREVIEW)
  const hidden  = total - PREVIEW

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--bg-raised)]"
        style={{ borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
            deptKey === 'SE'
              ? 'bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-400/20'
              : 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-400/20'
          }`}>
            {subject.name}
          </div>
          <Badge variant={deptKey === 'SE' ? 'se' : 'cs'}>{total} group{total !== 1 ? 's' : ''}</Badge>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={springSnappy}>
          <Icon name="chevronDown" size={15} className="text-[var(--text-muted)]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSmooth}>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visible.map(g => (
                  <GroupCard key={g.id} group={g}
                    members={membersMap[g.id] || []}
                    onClick={() => navigate('group-detail', g)} />
                ))}
              </div>
              {total > PREVIEW && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--bg-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  style={{ border: '1px dashed var(--border)' }}>
                  {expanded
                    ? <><Icon name="chevronUp" size={13} /> Show less</>
                    : <><Icon name="chevronDown" size={13} /> {hidden} more group{hidden !== 1 ? 's' : ''}</>
                  }
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Dept section ─────────────────────────────────────────────────────────────
function DeptSection({ dept, data, navigate, membersMap }) {
  const cfg       = DEPT[dept]
  const groups    = data?.groups || []
  const bySubject = data?.by_subject || []
  const [activeWalletId, setActiveWalletId] = useState(null)

  return (
    <section className="p-3 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm">
      {/* Dept header */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className={`h-5 w-1 rounded-full ${cfg.bar}`} />
          <h2 className="font-bold text-xs sm:text-base text-[var(--text-primary)]">{cfg.label}</h2>
          <Badge variant={cfg.badge} className="text-[10px]">{groups.length}</Badge>
        </div>
        <button
          onClick={() => navigate('browse-groups')}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 text-[11px] sm:text-xs bg-transparent border-0 cursor-pointer p-1"
        >
          View all <Icon name="arrowRight" size={11} />
        </button>
      </div>

      {groups.length === 0 ? (
        <EmptyState iconName={dept === 'SE' ? 'monitor' : 'code2'} title={`No ${cfg.label} groups`}
          action={<Button variant="outline" size="sm" onClick={() => navigate('create-group')}><Icon name="plus" size={13} /> Create one</Button>} />
      ) : bySubject.length > 0 ? (
        // Subject-grouped view - interactive wallets grid!
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 justify-items-center">
          {bySubject.map((subj, i) => (
            <motion.div key={subj.id || 'general'} variants={fadeUp} custom={i}>
              <SubjectWallet
                subject={subj}
                navigate={navigate}
                membersMap={membersMap}
                deptKey={dept}
                index={i}
                activeWalletId={activeWalletId}
                setActiveWalletId={setActiveWalletId}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        // Fallback flat grid
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.slice(0, 4).map(g => (
            <GroupCard key={g.id} group={g}
              members={membersMap[g.id] || []}
              onClick={() => navigate('group-detail', g)} />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user }             = useAuth()
  const { navigate }         = useApp()
  const [byDept, setByDept]  = useState({ SE: { groups: [], by_subject: [] }, CS: { groups: [], by_subject: [] } })
  const [all,    setAll]     = useState([])
  const [mine,   setMine]    = useState([])
  const [membersMap, setMap] = useState({})
  const [loading, setLoad]   = useState(true)

  useEffect(() => {
    Promise.all([groupsAPI.list(), groupsAPI.myGroups()])
      .then(async ([a, m]) => {
        const allGroups = a.data.groups || []
        const myGroups  = m.data.groups || []
        setAll(allGroups)
        setByDept(a.data.by_department || { SE: { groups: [], by_subject: [] }, CS: { groups: [], by_subject: [] } })
        setMine(myGroups)

        // Fetch members for all visible groups
        const ids = [...new Set(allGroups.map(g => g.id))]
        const results = await Promise.allSettled(
          ids.map(id => groupsAPI.members(id).then(r => ({ id, members: r.data.members || [] })))
        )
        const map = {}
        results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.members })
        setMap(map)
      })
      .catch(console.error)
      .finally(() => setLoad(false))
  }, [])

  const open   = all.filter(g => g.status === 'open').length
  const myDept = user?.department

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{user?.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{user?.roll_number}</span>
            {myDept && <Badge variant={myDept === 'SE' ? 'se' : 'cs'}>{myDept === 'SE' ? 'Software Engineering' : 'Computer Science'}</Badge>}
          </div>
        </div>
        <Button onClick={() => navigate('create-group')}><Icon name="plus" size={15} /> New Group</Button>
      </div>

      {loading ? (
        /* Unified Loading Skeletons */
        <div className="space-y-10">
          {/* Stats Skeletons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          
          {/* Quick Actions Skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-28 bg-[var(--border)] rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          </div>

          {/* Groups Skeletons */}
          <div className="space-y-6">
            <div className="h-6 w-48 bg-[var(--border)] rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)}
            </div>
          </div>
        </div>
      ) : (
        /* Loaded Content with Staggered Entrance Animation */
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-10">
          {/* Stats */}
          <div className="neu-container-card">
            <StatBox label="Total Groups" value={all.length}        icon="layers" />
            <StatBox label="My Groups"    value={mine.length}       icon="users"  />
            <StatBox label="Open Groups"  value={open}              icon="unlock" />
            <StatBox label="Locked"       value={all.length - open} icon="lock"   />
          </div>

          {/* Quick actions */}
          <motion.div variants={fadeUp}>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Quick Actions</p>
            <div className="neu-container-card">
              {[
                { icon: 'plus',     label: 'Create',   page: 'create-group',     colorClass: 'neu-orange' },
                { icon: 'search',   label: 'Browse',   page: 'browse-groups',    colorClass: 'neu-cyan' },
                { icon: 'users',    label: 'My Groups', page: 'my-groups',        colorClass: 'neu-indigo' },
                { icon: 'settings', label: 'Settings',  page: 'account-settings', colorClass: 'neu-pink' },
              ].map((a) => (
                <QuickActionCard key={a.page} a={a} navigate={navigate} />
              ))}
            </div>
          </motion.div>

          {/* Groups by dept → subject */}
          <motion.div variants={fadeUp} className="space-y-12">
            {myDept !== 'CS'
              ? <><DeptSection dept="SE" data={byDept.SE} navigate={navigate} membersMap={membersMap} />
                  <DeptSection dept="CS" data={byDept.CS} navigate={navigate} membersMap={membersMap} /></>
              : <><DeptSection dept="CS" data={byDept.CS} navigate={navigate} membersMap={membersMap} />
                  <DeptSection dept="SE" data={byDept.SE} navigate={navigate} membersMap={membersMap} /></>
            }
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
