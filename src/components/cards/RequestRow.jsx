import { useState } from 'react'
import Icon    from '../ui/Icons.jsx'
import { Avatar } from '../ui/misc.jsx'
import Button  from '../ui/Button.jsx'

export default function RequestRow({ request, onAccept, onReject }) {
  const [accepting, setA] = useState(false)
  const [rejecting, setR] = useState(false)
  const initials = request.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'??'
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)]">
      <Avatar initials={initials} dept={request.user?.department} size="sm"/>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{request.user?.name}</p>
        <p className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400/70">{request.user?.roll_number}</p>
        {request.message && <p className="text-xs text-[var(--text-muted)] italic mt-0.5 truncate">"{request.message}"</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="success" size="sm" loading={accepting} onClick={async()=>{setA(true);await onAccept(request.id);setA(false)}}><Icon name="check" size={12}/> Accept</Button>
        <Button variant="danger"  size="sm" loading={rejecting} onClick={async()=>{setR(true);await onReject(request.id);setR(false)}}><Icon name="x" size={12}/></Button>
      </div>
    </div>
  )
}
