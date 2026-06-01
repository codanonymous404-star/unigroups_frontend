import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../components/ui/Icons.jsx'
import { useEffect, useState } from 'react'
import { useAuth }   from '../context/AuthContext.jsx'
import { useApp }    from '../context/AppContext.jsx'
import { groupsAPI } from '../api/groups.js'
import GroupCard     from '../components/cards/GroupCard.jsx'
import Button        from '../components/ui/Button.jsx'
import Badge         from '../components/ui/Badge.jsx'
import { Skeleton } from '../components/ui/misc.jsx'
import { EmptyState } from '../components/ui/misc.jsx'

const DEPT = {
  SE:{ label:'Software Engineering', bar:'bg-orange-400', badge:'se' },
  CS:{ label:'Computer Science',     bar:'bg-cyan-400',   badge:'cs' },
}

function StatBox({ label, value, icon }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5">
      <div className="mb-2 text-indigo-600 dark:text-indigo-400"><Icon name={icon} size={22}/></div>
      <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{label}</p>
    </div>
  )
}

function DeptSection({ dept, data, navigate }) {
  const cfg = DEPT[dept]; const groups = data?.groups || []
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-5 w-1 rounded-full ${cfg.bar}`}/>
          <h2 className="font-bold text-[var(--text-primary)]">{cfg.label}</h2>
          <Badge variant={cfg.badge}>{groups.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('browse-groups')} className="text-indigo-600 dark:text-indigo-400">View all <Icon name="arrowRight" size={13}/></Button>
      </div>
      {groups.length === 0
        ? <EmptyState iconName={dept==='SE'?'monitor':'code2'} title={`No ${cfg.label} groups`} action={<Button variant="outline" size="sm" onClick={() => navigate('create-group')}><Icon name="plus" size={13}/> Create one</Button>}/>
        : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{groups.slice(0,4).map(g=><GroupCard key={g.id} group={g} onClick={()=>navigate('group-detail',g)}/>)}</div>
      }
    </section>
  )
}

export default function Dashboard() {
  const { user }            = useAuth()
  const { navigate }        = useApp()
  const [byDept, setByDept] = useState({ SE:{groups:[]}, CS:{groups:[]} })
  const [all,    setAll]    = useState([])
  const [mine,   setMine]   = useState([])
  const [loading,setLoad]   = useState(true)
  useEffect(() => {
    Promise.all([groupsAPI.list(), groupsAPI.myGroups()])
      .then(([a,m]) => { setAll(a.data.groups||[]); setByDept(a.data.by_department||{SE:{groups:[]},CS:{groups:[]}}); setMine(m.data.groups||[]) })
      .catch(console.error).finally(() => setLoad(false))
  }, [])
  const open = all.filter(g=>g.status==='open').length; const myDept = user?.department
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{user?.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{user?.roll_number}</span>
            {myDept && <Badge variant={myDept==='SE'?'se':'cs'}>{myDept==='SE'?'Software Engineering':'Computer Science'}</Badge>}
          </div>
        </div>
        <Button onClick={() => navigate('create-group')}><Icon name="plus" size={15}/> New Group</Button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array(4).fill(0).map((_,i)=><Skeleton key={i} className="h-28"/>) : <>
          <StatBox label="Total Groups"  value={all.length}  icon="layers"/>
          <StatBox label="My Groups"     value={mine.length} icon="users"/>
          <StatBox label="Open Groups"   value={open}        icon="unlock"/>
          <StatBox label="Locked"        value={all.length-open} icon="lock"/>
        </>}
      </div>
      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[{icon:'plus',label:'Create Group',desc:'Start a new team',page:'create-group'},{icon:'search',label:'Browse Groups',desc:'Find groups to join',page:'browse-groups'},{icon:'users',label:'My Groups',desc:'View your memberships',page:'my-groups'}].map(a=>(
            <motion.button key={a.page} onClick={()=>navigate(a.page)}
              whileHover={{ x:4, scale:1.01, borderColor:'rgba(99,102,241,0.4)', boxShadow:'0 8px 30px rgba(99,102,241,0.08)', transition:{type:'spring',stiffness:500,damping:28} }}
              whileTap={{ scale:0.97, transition:{type:'spring',stiffness:600,damping:30} }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] transition-colors group text-left">
              <motion.div
                whileHover={{ scale:1.12, rotate:[-3,3,-3,0], transition:{duration:0.3} }}
                className="w-11 h-11 rounded-xl bg-[var(--bg-raised)] group-hover:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 transition-colors">
                <Icon name={a.icon} size={18}/>
              </motion.div>
              <div className="flex-1"><p className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{a.label}</p><p className="text-xs text-[var(--text-muted)] mt-0.5">{a.desc}</p></div>
              <motion.div whileHover={{x:3}} transition={{type:'spring',stiffness:500}}>
                <Icon name="arrowRight" size={15} className="text-[var(--text-faint)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0"/>
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>
      {/* Groups by dept */}
      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Array(4).fill(0).map((_,i)=><Skeleton key={i} className="h-52"/>)}</div>
      : <div className="space-y-12">
          {myDept!=='CS'
            ? <><DeptSection dept="SE" data={byDept.SE} navigate={navigate}/><DeptSection dept="CS" data={byDept.CS} navigate={navigate}/></>
            : <><DeptSection dept="CS" data={byDept.CS} navigate={navigate}/><DeptSection dept="SE" data={byDept.SE} navigate={navigate}/></>
          }
        </div>
      }
    </div>
  )
}
