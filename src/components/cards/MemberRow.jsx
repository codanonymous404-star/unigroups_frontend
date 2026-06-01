// MemberRow
import { useState } from 'react'
import Icon    from '../ui/Icons.jsx'
import { Avatar } from '../ui/misc.jsx'
import Badge   from '../ui/Badge.jsx'
import Button  from '../ui/Button.jsx'
import { groupsAPI }    from '../../api/groups.js'
import { extractError } from '../../hooks/useApi.js'

export function MemberRow({ member, groupId, isLeader, isAdmin, currentUser, onRemoved }) {
  const [loading, setLoad] = useState(false)
  const isMe       = member.user?.id === currentUser?.id
  const initials   = member.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'??'
  const canRemove  = isAdmin || (isLeader && !isMe && member.role !== 'leader')
  const remove = async () => {
    if (!window.confirm(`Remove ${member.user?.name}?`)) return
    setLoad(true)
    try { await groupsAPI.removeMember(groupId, member.user?.id); onRemoved() }
    catch (e) { alert(extractError(e)) } finally { setLoad(false) }
  }
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-0">
      <Avatar initials={initials} dept={member.user?.department} size="md"/>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{member.user?.name}</p>
          {isMe && <span className="text-[10px] text-indigo-600 dark:text-indigo-400">(you)</span>}
        </div>
        <p className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400/70 mt-0.5">{member.user?.roll_number}</p>
      </div>
      <Badge variant={member.role}>{member.role==='leader'&&<Icon name="crown" size={9}/>}{member.role}</Badge>
      {canRemove && <Button variant="danger" size="xs" loading={loading} onClick={remove}><Icon name="x" size={12}/></Button>}
    </div>
  )
}
export default MemberRow
