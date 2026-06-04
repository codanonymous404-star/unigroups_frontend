import { motion } from 'framer-motion'
import Icon from '../components/ui/Icons.jsx'
import { useEffect, useState } from 'react'
import { useApp }    from '../context/AppContext.jsx'
import { groupsAPI } from '../api/groups.js'
import GroupCard     from '../components/cards/GroupCard.jsx'
import Button        from '../components/ui/Button.jsx'
import Badge         from '../components/ui/Badge.jsx'
import { Skeleton } from '../components/ui/misc.jsx'
import { EmptyState } from '../components/ui/misc.jsx'
import { fadeUp, staggerContainer, springSmooth } from '../utils/animations.js'

export default function MyGroups() {
  const { navigate }       = useApp()
  const [groups, setGrps]  = useState([]); const [reqs, setReqs] = useState([]); const [loading, setLoad] = useState(true)
  useEffect(()=>{Promise.all([groupsAPI.myGroups(),groupsAPI.myRequests()]).then(([g,r])=>{setGrps(g.data.groups||[]);setReqs(r.data.requests||[])}).catch(console.error).finally(()=>setLoad(false))},[])
  const leading = groups.filter(g=>g.my_role==='leader'); const member = groups.filter(g=>g.my_role==='member')
  
  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48"/>
      {Array(4).fill(0).map((_,i)=><Skeleton key={i} className="h-20"/>)}
    </div>
  )

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-10">
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Groups</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {groups.length===0?'You have no groups yet':`${groups.length} group${groups.length!==1?'s':''} · ${leading.length} leading, ${member.length} as member`}
          </p>
        </div>
        <Button size="sm" onClick={()=>navigate('create-group')}><Icon name="plus" size={14}/> New Group</Button>
      </motion.div>

      {groups.length===0 && (
        <motion.div variants={fadeUp}>
          <EmptyState iconName="users" title="No groups yet" description="Create your own or browse to find one" action={<div className="flex gap-3"><Button onClick={()=>navigate('browse-groups')}><Icon name="search" size={14}/> Browse</Button><Button variant="secondary" onClick={()=>navigate('create-group')}><Icon name="plus" size={14}/> Create</Button></div>}/>
        </motion.div>
      )}

      {leading.length>0&& (
        <motion.section variants={fadeUp}>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
            <Icon name="crown" size={14} className="text-amber-400"/>
            <h2 className="font-bold text-[var(--text-primary)] text-sm">Leading</h2>
            <Badge variant="leader">{leading.length}</Badge>
          </div>
          <div className="space-y-2">
            {leading.map(g=><GroupCard key={g.id} group={g} compact onClick={()=>navigate('group-detail',g)}/>)}
          </div>
        </motion.section>
      )}

      {member.length>0&& (
        <motion.section variants={fadeUp}>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
            <Icon name="users" size={14} className="text-[var(--text-secondary)]"/>
            <h2 className="font-bold text-[var(--text-primary)] text-sm">Member of</h2>
            <Badge variant="member">{member.length}</Badge>
          </div>
          <div className="space-y-2">
            {member.map(g=><GroupCard key={g.id} group={g} compact onClick={()=>navigate('group-detail',g)}/>)}
          </div>
        </motion.section>
      )}

      {reqs.length>0&& (
        <motion.section variants={fadeUp}>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
            <Icon name="clock" size={14} className="text-[var(--text-secondary)]"/>
            <h2 className="font-bold text-[var(--text-primary)] text-sm">Join Request History</h2>
            <Badge variant="brand">{reqs.length}</Badge>
          </div>
          <div className="space-y-2">
            {reqs.map(r=>(
              <motion.div whileHover={{ x: 2 }} transition={springSmooth} key={r.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{r.group_name||`Group #${r.group}`}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                    <Icon name="clock" size={10}/>{r.created_at?.split('T')[0]}
                  </p>
                </div>
                <Badge variant={r.status}>{r.status}</Badge>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  )
}
