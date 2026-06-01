import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../components/ui/Icons.jsx'
import { useEffect, useState } from 'react'
import { useAuth }      from '../context/AuthContext.jsx'
import { useApp }       from '../context/AppContext.jsx'
import { authAPI }      from '../api/auth.js'
import Button           from '../components/ui/Button.jsx'
import Input            from '../components/ui/Input.jsx'
import Alert            from '../components/ui/Alert.jsx'
import Badge            from '../components/ui/Badge.jsx'
import { Avatar, Skeleton, EmptyState } from '../components/ui/misc.jsx'
import DeptSelector     from '../components/forms/DeptSelector.jsx'
import { extractError } from '../hooks/useApi.js'
import { staggerContainer, fadeUp, spring, scaleIn } from '../utils/animations.js'

function AddModal({ onClose, onDone }) {
  const [f,setF]=useState({roll_number:'',name:'',email:'',department:'SE',password:'',password2:''})
  const [loading,setLoad]=useState(false);const [error,setError]=useState('')
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}))
  const submit=async e=>{
    e.preventDefault();setError('')
    if(f.password!==f.password2){setError('Passwords do not match.');return}
    setLoad(true)
    try{
      await authAPI.register({...f,roll_number:f.roll_number.toUpperCase().trim()})
      const list=await authAPI.listUsers({role:'student'})
      const nu=list.data.users.find(u=>u.roll_number===f.roll_number.toUpperCase().trim())
      if(nu)await authAPI.updateUser(nu.id,{is_verified:true,department:f.department})
      onDone();onClose()
    }catch(err){setError(extractError(err))}finally{setLoad(false)}
  }
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)'}}>
      <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} transition={springSmooth}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
        style={{background:'var(--bg-surface)',border:'1px solid var(--border)'}}>
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid var(--border)'}}>
          <div><h2 className="font-bold text-base text-[var(--text-primary)]">Add New Student</h2><p className="text-xs text-[var(--text-muted)] mt-0.5">Auto-verified</p></div>
          <motion.button whileTap={{scale:0.88}} onClick={onClose} className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]"><Icon name="x" size={18}/></motion.button>
        </div>
        <div className="p-5 space-y-4">
          <Alert type="error" message={error} onClose={()=>setError('')}/>
          <Input label="Roll Number" placeholder="SU72-BSSEM-F25-017" hint="Format: SU##-DEPT-X##-###" value={f.roll_number} onChange={e=>setF(p=>({...p,roll_number:e.target.value.toUpperCase()}))} mono required/>
          <Input label="Full Name" placeholder="Ali Hassan" value={f.name} onChange={set('name')} required/>
          <Input label="Email" type="email" placeholder="ali@su.edu.pk" value={f.email} onChange={set('email')} required/>
          <DeptSelector value={f.department} onChange={v=>setF(p=>({...p,department:v}))}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Password" type="password" placeholder="min 8" value={f.password} onChange={set('password')} required/>
            <Input label="Confirm" type="password" placeholder="repeat" value={f.password2} onChange={set('password2')} required/>
          </div>
          <div className="flex gap-3 pt-1">
            <Button loading={loading} fullWidth onClick={submit}><Icon name="userPlus" size={14}/> Add Student</Button>
            <Button variant="secondary" onClick={onClose} className="shrink-0">Cancel</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EditDeptModal({ user, onClose, onSaved }) {
  const [dept,setDept]=useState(user.department||'SE')
  const [loading,setLoad]=useState(false);const [error,setError]=useState('')
  const save=async()=>{setLoad(true);setError('');try{await authAPI.updateUser(user.id,{department:dept});onSaved();onClose()}catch(err){setError(extractError(err))}finally{setLoad(false)}}
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)'}}>
      <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} transition={springSmooth}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl"
        style={{background:'var(--bg-surface)',border:'1px solid var(--border)'}}>
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid var(--border)'}}>
          <div><h2 className="font-bold text-base text-[var(--text-primary)]">Edit Department</h2><p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">{user.roll_number}</p></div>
          <motion.button whileTap={{scale:0.88}} onClick={onClose} className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]"><Icon name="x" size={18}/></motion.button>
        </div>
        <div className="p-5 space-y-4">
          <Alert type="error" message={error} onClose={()=>setError('')}/>
          <DeptSelector value={dept} onChange={setDept}/>
          <div className="flex gap-3">
            <Button loading={loading} onClick={save} fullWidth>Save Changes</Button>
            <Button variant="secondary" onClick={onClose} className="shrink-0">Cancel</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Responsive user card
function UserCard({ u, onEdit, onToggleRole, onDelete, changing, deleting }) {
  const initials = u.name.split(' ').map(w=>w[0]).join('').slice(0,2)
  const dColor   = u.department==='SE'?'text-orange-500 dark:text-orange-400':u.department==='CS'?'text-cyan-500 dark:text-cyan-400':'text-[var(--text-muted)]'
  const dLabel   = u.department==='SE'?'Software Engineering':u.department==='CS'?'Computer Science':'No department'
  const dBorder  = u.department==='SE'?'border-orange-400':u.department==='CS'?'border-cyan-400':'border-[var(--border)]'

  return (
    <motion.div variants={fadeUp} layout
      className={`rounded-2xl border-l-[3px] overflow-hidden ${dBorder}`}
      style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderLeftWidth:'3px',borderLeftColor: u.department==='SE'?'#fb923c':u.department==='CS'?'#22d3ee':'var(--border)'}}>
      <div className="p-4">
        {/* Top row — avatar + name + badges */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar initials={initials} dept={u.department} size="md"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-bold text-sm text-[var(--text-primary)] truncate">{u.name}</p>
              {u.role==='admin' && <Badge variant="admin">Admin</Badge>}
            </div>
            <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wide">{u.roll_number}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {u.is_verified
                ? <Badge variant="success"><Icon name="check" size={9}/> Verified</Badge>
                : <Badge variant="warning">Unverified</Badge>}
              <span className={`text-xs font-medium ${dColor}`}>{dLabel}</span>
            </div>
          </div>
        </div>

        {/* Action buttons — full width on mobile */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={()=>onEdit(u)} className="flex-1 sm:flex-none">
            <Icon name="pencil" size={12}/> Dept
          </Button>
          <Button
            variant={u.role==='admin'?'danger':'outline'} size="sm"
            loading={changing===u.id} onClick={()=>onToggleRole(u)}
            className="flex-1 sm:flex-none">
            {u.role==='admin'
              ? <><Icon name="shieldX" size={12}/> Revoke</>
              : <><Icon name="shieldCheck" size={12}/> Admin</>}
          </Button>
          <Button variant="danger" size="sm" loading={deleting===u.id} onClick={()=>onDelete(u)}>
            <Icon name="x" size={12}/>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function AdminUsers() {
  const { isAdmin }=useAuth();const { navigate }=useApp()
  const [users,setUsers]=useState([]);const [loading,setLoad]=useState(true)
  const [deptTab,setDeptTab]=useState('all');const [query,setQuery]=useState('')
  const [error,setError]=useState('');const [ok,setOk]=useState('')
  const [showAdd,setShowAdd]=useState(false);const [editUser,setEditUser]=useState(null)
  const [changing,setChanging]=useState(null);const [deleting,setDeleting]=useState(null)

  const loadUsers=()=>{
    setLoad(true)
    const p={}
    if(deptTab!=='all')p.dept=deptTab
    authAPI.listUsers(p).then(r=>setUsers(r.data.users||[])).catch(e=>setError(extractError(e))).finally(()=>setLoad(false))
  }
  useEffect(()=>{if(!isAdmin){navigate('dashboard');return}loadUsers()},[isAdmin,deptTab])

  const toggleRole=async u=>{
    setChanging(u.id);setError('');setOk('')
    try{await authAPI.updateUser(u.id,{role:u.role==='admin'?'student':'admin'});setOk(`${u.name} updated.`);loadUsers()}
    catch(e){setError(extractError(e))}finally{setChanging(null)}
  }
  const del=async u=>{
    if(!window.confirm(`Delete ${u.roll_number}?`))return
    setDeleting(u.id)
    try{await authAPI.deleteUser(u.id);setOk(`${u.name} deleted.`);loadUsers()}
    catch(e){setError(extractError(e))}finally{setDeleting(null)}
  }

  const filtered=users.filter(u=>
    u.name.toLowerCase().includes(query.toLowerCase())||
    u.roll_number.toLowerCase().includes(query.toLowerCase())||
    u.email.toLowerCase().includes(query.toLowerCase())
  )
  const seCnt=users.filter(u=>u.department==='SE').length
  const csCnt=users.filter(u=>u.department==='CS').length
  const unCnt=users.filter(u=>!u.department).length
  const unverCnt=users.filter(u=>!u.is_verified).length

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showAdd && <AddModal onClose={()=>setShowAdd(false)} onDone={loadUsers}/>}
        {editUser && <EditDeptModal user={editUser} onClose={()=>setEditUser(null)} onSaved={loadUsers}/>}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon name="shieldCheck" size={18} className="text-indigo-600 dark:text-indigo-400"/>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manage Students</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Add students, assign departments, manage roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={loadUsers}><Icon name="refreshCw" size={14}/></Button>
          <Button onClick={()=>setShowAdd(true)}><Icon name="userPlus" size={15}/> Add Student</Button>
        </div>
      </motion.div>

      <Alert type="error" message={error} onClose={()=>setError('')}/>
      <Alert type="success" message={ok}/>

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {l:'SE Students', c:seCnt,    color:'text-orange-500 dark:text-orange-400', bg:'bg-orange-50 dark:bg-orange-400/8 border-orange-200 dark:border-orange-400/20'},
          {l:'CS Students', c:csCnt,    color:'text-cyan-500 dark:text-cyan-400',     bg:'bg-cyan-50 dark:bg-cyan-400/8 border-cyan-200 dark:border-cyan-400/20'},
          {l:'Unassigned',  c:unCnt,    color:'text-[var(--text-secondary)]',          bg:'bg-[var(--bg-raised)] border-[var(--border)]'},
          {l:'Unverified',  c:unverCnt, color:'text-amber-500 dark:text-amber-400',   bg:'bg-amber-50 dark:bg-amber-400/8 border-amber-200 dark:border-amber-400/20'},
        ].map(({l,c,color,bg})=>(
          <motion.div key={l} variants={fadeUp}
            className={`rounded-2xl border p-4 text-center ${bg}`}>
            <p className={`text-2xl font-bold ${c>0?color:'text-[var(--text-faint)]'}`}>{c}</p>
            <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">{l}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 rounded-xl w-full sm:w-auto" style={{background:'var(--bg-raised)',border:'1px solid var(--border)'}}>
          {[{k:'all',l:'All'},{k:'SE',l:'SE'},{k:'CS',l:'CS'},{k:'',l:'None'}].map(({k,l})=>(
            <button key={k} onClick={()=>setDeptTab(k)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all
                ${deptTab===k
                  ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <Input icon={<Icon name="search" size={14}/>} placeholder="Search name, roll number, email…" value={query} onChange={e=>setQuery(e.target.value)}/>
        </div>
      </div>

      {!loading && <p className="text-xs text-[var(--text-muted)]">{filtered.length} student{filtered.length!==1?'s':''}</p>}

      {/* List */}
      {loading
        ? <div className="space-y-3">{Array(4).fill(0).map((_,i)=><Skeleton key={i} className="h-28"/>)}</div>
        : filtered.length===0
          ? <EmptyState iconName="users" title="No students found" action={<Button size="sm" onClick={()=>setShowAdd(true)}><Icon name="userPlus" size={13}/> Add Student</Button>}/>
          : <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
              {filtered.map(u=>(
                <UserCard key={u.id} u={u}
                  onEdit={setEditUser}
                  onToggleRole={toggleRole}
                  onDelete={del}
                  changing={changing}
                  deleting={deleting}/>
              ))}
            </motion.div>
      }
    </div>
  )
}
