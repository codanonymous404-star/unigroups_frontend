// Custom SVG icon set — sharp, modern, consistent 20px viewBox
// Usage: <Icon name="dashboard" size={16} className="text-indigo-500" />

const paths = {
  dashboard:    <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  plus:         <><path d="M12 5v14M5 12h14" strokeLinecap="round"/></>,
  search:       <><circle cx="10.5" cy="10.5" r="6"/><path d="M15.5 15.5L20 20" strokeLinecap="round"/></>,
  users:        <><circle cx="8" cy="7" r="3.5"/><path d="M2 19c0-4 2.5-6 6-6s6 2 6 6"/><circle cx="16.5" cy="8" r="2.5"/><path d="M14 19c0-2.5 1.5-4 4-4s4 1.5 4 4"/></>,
  shield:       <><path d="M12 3L4 6.5v5c0 4 3.5 7.5 8 8.5 4.5-1 8-4.5 8-8.5v-5L12 3z"/></>,
  logout:       <><path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round"/></>,
  bell:         <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></>,
  graduationCap: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round"/></>,
  sun:          <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round"/></>,
  moon:         <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
  menu:         <><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/></>,
  layers:       <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  chevronRight: <><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></>,
  arrowLeft:    <><path d="M19 12H5M5 12l7 7M5 12l7-7" strokeLinecap="round" strokeLinejoin="round"/></>,
  arrowRight:   <><path d="M5 12h14M14 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></>,
  lock:         <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round"/></>,
  unlock:       <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.43-1.35" strokeLinecap="round"/></>,
  crown:        <><path d="M3 17L6 7l6 5 6-5 3 10H3z"/><path d="M3 17h18" strokeLinecap="round"/></>,
  calendar:     <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></>,
  check:        <><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></>,
  x:            <><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></>,
  pencil:       <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  shieldCheck:  <><path d="M12 3L4 6.5v5c0 4 3.5 7.5 8 8.5 4.5-1 8-4.5 8-8.5v-5L12 3z"/><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></>,
  shieldX:      <><path d="M12 3L4 6.5v5c0 4 3.5 7.5 8 8.5 4.5-1 8-4.5 8-8.5v-5L12 3z"/><path d="M14.5 9.5l-5 5M9.5 9.5l5 5" strokeLinecap="round"/></>,
  shieldAlert:  <><path d="M12 3L4 6.5v5c0 4 3.5 7.5 8 8.5 4.5-1 8-4.5 8-8.5v-5L12 3z"/><path d="M12 9v4M12 16.5v.5" strokeLinecap="round"/></>,
  trash:        <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round"/></>,
  userPlus:     <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 11h6M19 8v6" strokeLinecap="round"/></>,
  refreshCw:    <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round"/></>,
  mail:         <><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2 4 12 13 22 4"/></>,
  creditCard:   <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
  keyRound:     <><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3" strokeLinecap="round"/></>,
  user:         <><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></>,
  monitor:      <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4" strokeLinecap="round"/></>,
  code2:        <><path d="M9 6L5 12l4 6M15 6l4 6-4 6M13 4l-2 16" strokeLinecap="round" strokeLinejoin="round"/></>,
  clock:        <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></>,
  fileText:     <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/></>,
  checkCircle:  <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/></>,
  loader:       <><path d="M21 12a9 9 0 1 1-6.22-8.56" strokeLinecap="round"/></>,
}

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.8 }) {
  const content = paths[name]
  if (!content) return null
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      className={className}
    >
      {content}
    </svg>
  )
}
