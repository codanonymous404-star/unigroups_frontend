import Icon from '../components/ui/Icons.jsx'
import { useState, useEffect } from 'react'
import { useApp }       from '../context/AppContext.jsx'
import { useAuth }      from '../context/AuthContext.jsx'
import { groupsAPI }    from '../api/groups.js'
import { authAPI }      from '../api/auth.js'
import Button           from '../components/ui/Button.jsx'
import Input            from '../components/ui/Input.jsx'
import Alert            from '../components/ui/Alert.jsx'
import Card             from '../components/ui/Card.jsx'
import DeptSelector     from '../components/forms/DeptSelector.jsx'
import MemberPicker     from '../components/forms/MemberPicker.jsx'
import { extractError } from '../hooks/useApi.js'
export default function CreateGroup() {
  const { navigate }             = useApp(); const { user, isAdmin } = useAuth()
  const studentDept              = !isAdmin ? user?.department : null
  const [form, setForm]          = useState({ name:'', department:studentDept||'', max_members:'', description:'' })
  const [people, setPeople]      = useState([]); const [selected, setSel] = useState([])
  const [loadPpl, setLoadPpl]    = useState(false); const [loading, setLoad] = useState(false)
  const [done, setDone]          = useState(false); const [created, setCreated] = useState(null); const [error, setError] = useState('')
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))
  const toggle = id => setSel(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  useEffect(()=>{
    const dept = form.department; if (!dept) return
    setLoadPpl(true); setSel([])
    const fn = isAdmin ? authAPI.getStudentsByDept(dept) : authAPI.classmates()
    fn.then(r=>setPeople(isAdmin?r.data.users||[]:r.data.classmates||[])).catch(console.error).finally(()=>setLoadPpl(false))
  },[form.department, isAdmin])
  const submit = async e => {
    e.preventDefault(); setError('')
    if (!form.name.trim()) { setError('Group name required.'); return }
    if (!form.department)  { setError('Select a department.'); return }
    const max = parseInt(form.max_members)
    if (!max||max<2||max>20) { setError('Max members must be 2–20.'); return }
    setLoad(true)
    try { const r = await groupsAPI.create({name:form.name.trim(),department:form.department,max_members:max,description:form.description.trim(),member_ids:selected}); setCreated(r.data.group); setDone(true) }
    catch (err) { setError(extractError(err)) } finally { setLoad(false) }
  }
  if (done) return (
    <div className="max-w-sm mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-5"><Icon name="checkCircle" size={36} className="text-green-400"/></div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Group Created!</h2>
      <p className="text-[var(--text-secondary)] text-sm mb-1"><span className="text-[var(--text-primary)] font-semibold">"{form.name}"</span> is now live.</p>
      {created?.member_count>1&&<p className="text-indigo-600 dark:text-indigo-400 text-sm">{created.member_count} members added</p>}
      <div className="flex gap-3 justify-center mt-8">
        <Button onClick={()=>navigate('my-groups')}>View My Groups</Button>
        <Button variant="secondary" onClick={()=>{setDone(false);setForm({name:'',department:studentDept||'',max_members:'',description:''});setSel([]);setError('');setCreated(null)}}>Create Another</Button>
      </div>
    </div>
  )
  return (
    <div className="max-w-xl space-y-6">
      <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Create a Group</h1><p className="text-sm text-[var(--text-secondary)] mt-1">{isAdmin?'Admin: choose any department':'Pick classmates and start a team'}</p></div>
      <Card>
        <Alert type="error" message={error} onClose={()=>setError('')}/>
        <form onSubmit={submit} className={`space-y-5 ${error?'mt-4':''}`}>
          <DeptSelector value={form.department} onChange={v=>setForm(p=>({...p,department:v}))} locked={!isAdmin} lockedDept={studentDept}/>
          <Input label="Group Name" placeholder="Alpha Dev Squad" value={form.name} onChange={set('name')} required/>
          <Input label="Max Members" type="number" placeholder="5" hint="2–20" value={form.max_members} onChange={set('max_members')} min={2} max={20} required/>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Description <span className="text-[var(--text-faint)] font-normal normal-case">(optional)</span></label>
            <div className="relative"><Icon name="fileText" size={14} className="absolute left-3.5 top-3.5 text-[var(--text-faint)] pointer-events-none"/><textarea rows={2} placeholder="What is this group working on?" value={form.description} onChange={set('description')} className="w-full pl-10 pr-4 py-3 text-sm bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-faint)] rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-none"/></div>
          </div>
          {(form.department||studentDept)&&<MemberPicker people={people} selected={selected} onToggle={toggle} dept={form.department||studentDept} loading={loadPpl}/>}
          <div className="px-4 py-3 rounded-xl bg-indigo-500/8 border border-indigo-500/15"><p className="text-xs text-[var(--text-secondary)]">{isAdmin?'🛡️ Admin mode — you will be group leader':'⭐ You will be Group Leader · selected classmates join immediately'}</p></div>
          <Button type="submit" size="lg" loading={loading} disabled={!form.name||!form.department||!form.max_members} fullWidth><Icon name="plus" size={16}/> Create Group</Button>
        </form>
      </Card>
    </div>
  )
}
