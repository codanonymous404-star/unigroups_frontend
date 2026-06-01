import Icon from '../components/ui/Icons.jsx'
import { useEffect, useState, useCallback } from 'react'
import { useApp }    from '../context/AppContext.jsx'
import { useAuth }   from '../context/AuthContext.jsx'
import { groupsAPI } from '../api/groups.js'
import GroupCard     from '../components/cards/GroupCard.jsx'
import Input         from '../components/ui/Input.jsx'
import { Skeleton } from '../components/ui/misc.jsx'
import Alert         from '../components/ui/Alert.jsx'
import { EmptyState } from '../components/ui/misc.jsx'
import Button        from '../components/ui/Button.jsx'
import Badge         from '../components/ui/Badge.jsx'
import { extractError } from '../hooks/useApi.js'
const DTABS = [{k:'all',l:'All Depts'},{k:'SE',l:'SE'},{k:'CS',l:'CS'}]
const STABS = [{k:'all',l:'All'},{k:'open',l:'Open'},{k:'locked',l:'Locked'}]
export default function BrowseGroups() {
  const { navigate }       = useApp(); const { user } = useAuth(); const myDept = user?.department
  const [groups,  setGrps] = useState([]); const [loading, setLoad] = useState(true)
  const [query,   setQ]    = useState(''); const [dept, setDept] = useState(myDept||'all'); const [status, setStat] = useState('all')
  const [joining, setJoin] = useState(null); const [success, setOk] = useState(''); const [error, setErr] = useState('')
  const load = useCallback(() => {
    setLoad(true); const p={}; if(dept!=='all')p.dept=dept; if(status!=='all')p.status=status; if(query.trim())p.search=query.trim()
    groupsAPI.list(p).then(r=>setGrps(r.data.groups||[])).catch(e=>setErr(extractError(e))).finally(()=>setLoad(false))
  }, [dept,status,query])
  useEffect(()=>{load()},[dept,status])
  useEffect(()=>{const t=setTimeout(load,400);return()=>clearTimeout(t)},[query])
  const join = async id => {
    setJoin(id);setErr('');setOk('')
    try{const r=await groupsAPI.sendRequest({group_id:id});setOk(r.data.message);load()}catch(e){setErr(extractError(e))}finally{setJoin(null)}
  }
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Browse Groups</h1><p className="text-sm text-[var(--text-secondary)] mt-1">Find and join study or project groups{myDept&&<span className="text-indigo-600 dark:text-indigo-400"> · Your department shown first</span>}</p></div>
      {success&&<Alert type="success" message={success}/>}{error&&<Alert type="error" message={error} onClose={()=>setErr('')}/>}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><Input icon={<Icon name="search" size={15}/>} placeholder="Search groups…" value={query} onChange={e=>setQ(e.target.value)}/></div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] shrink-0">
          {STABS.map(t=><button key={t.k} onClick={()=>setStat(t.k)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${status===t.k?'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25':'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}>{t.l}</button>)}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {DTABS.map(({k,l})=><button key={k} onClick={()=>setDept(k)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${dept===k?'bg-indigo-500 border-indigo-500 text-[var(--text-primary)] shadow-lg shadow-indigo-500/20':'bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/30'}`}>{l}{k!=='all'&&k===myDept&&<Badge variant={k==='SE'?'se':'cs'} className="text-[9px] !px-1.5 !py-0">Mine</Badge>}</button>)}
      </div>
      {!loading&&<p className="text-xs text-[var(--text-muted)]">{groups.length} group{groups.length!==1?'s':''} found</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading?Array(6).fill(0).map((_,i)=><Skeleton key={i} className="h-52"/>)
        :groups.length===0?<div className="col-span-full"><EmptyState iconName="search" title="No groups found" description={query?`No results for "${query}"`:'Try a different filter'} action={<Button variant="outline" size="sm" onClick={()=>{setQ('');setDept('all');setStat('all')}}>Clear filters</Button>}/></div>
        :groups.map(g=><GroupCard key={g.id} group={g} showJoin joinLoading={joining===g.id} onJoin={join} onClick={()=>navigate('group-detail',g)}/>)}
      </div>
    </div>
  )
}
