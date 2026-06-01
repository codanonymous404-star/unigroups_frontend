import Icon from '../components/ui/Icons.jsx'
import { useEffect, useState } from 'react'
import { useApp }     from '../context/AppContext.jsx'
import { useAuth }    from '../context/AuthContext.jsx'
import { groupsAPI }  from '../api/groups.js'
import { MemberRow } from '../components/cards/MemberRow.jsx'
import RequestRow     from '../components/cards/RequestRow.jsx'
import Button         from '../components/ui/Button.jsx'
import Badge          from '../components/ui/Badge.jsx'
import Card           from '../components/ui/Card.jsx'
import Alert          from '../components/ui/Alert.jsx'
import { Skeleton } from '../components/ui/misc.jsx'
import { Progress } from '../components/ui/misc.jsx'
import { extractError } from '../hooks/useApi.js'
export default function GroupDetails() {
  const { selectedGroup, navigate } = useApp(); const { user, isAdmin } = useAuth()
  const [group, setGroup]  = useState(null); const [loading, setLoad] = useState(true)
  const [error, setError]  = useState('');   const [ok, setOk]       = useState('')
  const [locking, setLock] = useState(false); const [deleting, setDel] = useState(false); const [confirm, setConf] = useState(false)
  const id = selectedGroup?.id
  const load = () => {
    if (!id) return; setLoad(true)
    groupsAPI.detail(id).then(r=>setGroup(r.data.group)).catch(e=>setError(extractError(e))).finally(()=>setLoad(false))
  }
  useEffect(()=>{load()},[id])
  if (!id) return <div className="py-20 text-center"><p className="text-[var(--text-muted)] mb-4">No group selected.</p><Button variant="outline" onClick={()=>navigate('browse-groups')}>Browse Groups</Button></div>
  if (loading) return <div className="max-w-2xl space-y-4">{Array(3).fill(0).map((_,i)=><Skeleton key={i} className="h-36"/>)}</div>
  if (!group) return <Alert type="error" message={error||'Group not found.'}/>
  const isLeader = group.members?.some(m=>m.user?.id===user?.id&&m.role==='leader')
  const isMember = group.members?.some(m=>m.user?.id===user?.id)
  const pending  = group.pending_requests||[]
  const mc       = group.member_count??group.members?.length??0
  const dBar     = group.department==='SE'?'bg-orange-400':'bg-cyan-400'
  const dBadge   = group.department==='SE'?'se':'cs'
  const toggleLock = async()=>{
    setLock(true);setError('');setOk('')
    try{const r=await(group.is_locked?groupsAPI.unlock:groupsAPI.lock)(group.id);setOk(r.data.message);load()}catch(e){setError(extractError(e))}finally{setLock(false)}
  }
  const handleAccept = async rid=>{setError('');setOk('');try{const r=await groupsAPI.acceptRequest(rid);setOk(r.data.message);load()}catch(e){setError(extractError(e))}}
  const handleReject = async rid=>{setError('');setOk('');try{const r=await groupsAPI.rejectRequest(rid);setOk(r.data.message);load()}catch(e){setError(extractError(e))}}
  const handleDelete = async()=>{setDel(true);try{await groupsAPI.delete(group.id);navigate('my-groups')}catch(e){setError(extractError(e));setDel(false)}}
  const handleJoin   = async()=>{setError('');setOk('');try{const r=await groupsAPI.sendRequest({group_id:group.id});setOk(r.data.message)}catch(e){setError(extractError(e))}}
  return (
    <div className="max-w-2xl space-y-5">
      <button onClick={()=>navigate('browse-groups')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"><Icon name="arrowLeft" size={15} className="group-hover:-translate-x-0.5 transition-transform"/> Back to groups</button>
      {ok    && <Alert type="success" message={ok}/>}
      {error && <Alert type="error"   message={error} onClose={()=>setError('')}/>}
      {/* Hero card */}
      <Card padding={false} className="overflow-hidden">
        <div className={`h-1 w-full ${dBar}`}/>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={dBadge}>{group.department}</Badge>
              <Badge variant={group.is_locked?'locked':'open'}>{group.is_locked?<Icon name="lock" size={9}/>:<Icon name="unlock" size={9}/>}{group.is_locked?'Locked':'Open'}</Badge>
              {isLeader&&<Badge variant="leader">⭐ Leader</Badge>}
              {!isLeader&&isMember&&<Badge variant="member">◆ Member</Badge>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={load}><Icon name="refreshCw" size={13}/></Button>
              {(isLeader||isAdmin)&&<Button variant={group.is_locked?'success':'outline'} size="sm" loading={locking} onClick={toggleLock}>{group.is_locked?<><Icon name="unlock" size={13}/> Unlock</>:<><Icon name="lock" size={13}/> Lock</>}</Button>}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{group.name}</h1>
          {group.description&&<p className="text-sm text-[var(--text-secondary)] mb-4">{group.description}</p>}
          <div className="mt-4"><Progress current={mc} max={group.max_members}/></div>
        </div>
      </Card>
      {/* Admin controls */}
      {isAdmin&&<Card className="border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 mb-4"><Icon name="shieldAlert" size={15} className="text-red-400"/><h2 className="font-bold text-sm text-red-400">Admin Controls</h2><Badge variant="admin">Admin</Badge></div>
        <div className="flex gap-3 flex-wrap">
          {!confirm?<Button variant="danger" size="sm" onClick={()=>setConf(true)}><Icon name="trash" size={13}/> Delete Group</Button>
          :<div className="flex items-center gap-2 flex-wrap"><span className="text-xs text-red-400">Permanently delete?</span><Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}><Icon name="check" size={12}/> Yes</Button><Button variant="ghost" size="sm" onClick={()=>setConf(false)}>Cancel</Button></div>}
        </div>
      </Card>}
      {/* Members */}
      <Card>
        <div className="flex items-center gap-2 mb-1"><h2 className="font-bold text-[var(--text-primary)]">Members</h2><span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">[ {mc} ]</span></div>
        <p className="text-xs text-[var(--text-muted)] mb-4">{group.max_members-mc} slot{group.max_members-mc!==1?'s':''} remaining</p>
        <div>{group.members?.map(m=><MemberRow key={m.id} member={m} groupId={group.id} isLeader={isLeader} isAdmin={isAdmin} currentUser={user} onRemoved={load}/>)}</div>
      </Card>
      {/* Join requests */}
      {(isLeader||isAdmin)&&<Card>
        <div className="flex items-center gap-2 mb-4"><Icon name="userPlus" size={15} className="text-indigo-600 dark:text-indigo-400"/><h2 className="font-bold text-[var(--text-primary)]">Join Requests</h2>{pending.length>0&&<span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">{pending.length} pending</span>}</div>
        {pending.length===0?<p className="text-sm text-[var(--text-muted)]">No pending requests.</p>:<div className="space-y-2">{pending.map(r=><RequestRow key={r.id} request={r} onAccept={handleAccept} onReject={handleReject}/>)}</div>}
      </Card>}
      {/* Join CTA */}
      {!isMember&&!group.is_locked&&mc<group.max_members&&<Button size="lg" fullWidth onClick={handleJoin}><Icon name="userPlus" size={16}/> Request to Join Group</Button>}
      {!isMember&&(group.is_locked||mc>=group.max_members)&&<div className="text-center py-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)]"><p className="text-sm text-[var(--text-muted)]">{group.is_locked?'This group is locked.':'This group is full.'}</p></div>}
    </div>
  )
}
