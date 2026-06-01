/**
 * generateDeptPDF
 * Generates a professional PDF for selected groups (one or more departments).
 */
export function generateDeptPDF(selectedGroups, dept) {
  const now     = new Date().toLocaleDateString('en-PK', { day:'2-digit', month:'long', year:'numeric' })
  const deptMap = { SE:'Software Engineering', CS:'Computer Science' }
  const deptLabel = dept ? deptMap[dept] : 'All Departments'
  const totalMembers = selectedGroups.reduce((s,g) => s + (g.members?.length||0), 0)

  const groupSections = selectedGroups.map((group, gi) => {
    const d       = deptMap[group.department] || group.department
    const mc      = group.members?.length || 0
    const barColor= group.department === 'SE' ? '#f97316' : '#06b6d4'

    const rows = (group.members || []).map((m, i) => {
      const name   = m.user?.name || '—'
      const roll   = m.user?.roll_number || '—'
      const email  = m.user?.email || '—'
      const role   = m.role === 'leader' ? 'Group Leader' : 'Member'
      const joined = m.joined_at ? new Date(m.joined_at).toLocaleDateString('en-PK') : '—'
      const rowBg  = i % 2 === 0 ? '#f8f9fb' : '#ffffff'
      return `
        <tr style="background:${rowBg}">
          <td style="padding:9px 12px;border-bottom:1px solid #e8eaf0;font-size:11px;color:#374151;font-weight:600">${i+1}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #e8eaf0">
            <div style="font-size:12px;font-weight:700;color:#111827">${name}</div>
            <div style="font-size:10px;color:#6366f1;font-family:monospace;margin-top:1px">${roll}</div>
          </td>
          <td style="padding:9px 12px;border-bottom:1px solid #e8eaf0;font-size:11px;color:#6b7280">${email}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #e8eaf0;text-align:center">
            <span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;
              background:${m.role==='leader'?'#fef3c7':'#ede9fe'};
              color:${m.role==='leader'?'#92400e':'#4338ca'};
              border:1px solid ${m.role==='leader'?'#fde68a':'#c4b5fd'}">
              ${role}
            </span>
          </td>
          <td style="padding:9px 12px;border-bottom:1px solid #e8eaf0;font-size:11px;color:#6b7280;text-align:center">${joined}</td>
        </tr>`
    }).join('')

    const emptyRow = mc === 0
      ? `<tr><td colspan="5" style="padding:20px;text-align:center;color:#9ca3af;font-size:12px;font-style:italic">No members yet</td></tr>`
      : ''

    return `
      <!-- Group ${gi+1} -->
      <div style="margin-bottom:28px;${gi > 0 ? 'page-break-inside:avoid;' : ''}">
        <!-- Group header bar -->
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f8f9fb;border:1px solid #e8eaf0;border-left:4px solid ${barColor};border-radius:8px;margin-bottom:0">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
              <span style="font-size:14px;font-weight:800;color:#111827">${group.name}</span>
              <span style="padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:${group.status==='open'?'#dcfce7':'#f1f5f9'};color:${group.status==='open'?'#166534':'#475569'};border:1px solid ${group.status==='open'?'#bbf7d0':'#e2e8f0'}">${group.status==='open'?'Open':'Locked'}</span>
            </div>
            <span style="font-size:11px;color:#6b7280">${d} &nbsp;·&nbsp; ${mc} / ${group.max_members} members &nbsp;·&nbsp; Created ${group.created_at?.split('T')[0]||'—'}</span>
          </div>
          <div style="text-align:right">
            <div style="font-size:18px;font-weight:800;color:${barColor}">${mc}</div>
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Members</div>
          </div>
        </div>
        <!-- Members table -->
        <table style="width:100%;border-collapse:collapse;border:1px solid #e8eaf0;border-top:none;border-radius:0 0 8px 8px;overflow:hidden">
          <thead>
            <tr style="background:#f1f3f9">
              <th style="padding:8px 12px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e8eaf0">#</th>
              <th style="padding:8px 12px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e8eaf0">Student</th>
              <th style="padding:8px 12px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e8eaf0">Email</th>
              <th style="padding:8px 12px;text-align:center;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e8eaf0">Role</th>
              <th style="padding:8px 12px;text-align:center;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:2px solid #e8eaf0">Joined</th>
            </tr>
          </thead>
          <tbody>${rows}${emptyRow}</tbody>
        </table>
      </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${deptLabel} — Groups Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; }
    @page { margin: 15mm 12mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-break { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- Main Header -->
  <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:24px 28px;color:#fff;margin-bottom:0;border-radius:12px 12px 0 0">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <span style="font-size:16px;font-weight:800">UniGroups</span>
        </div>
        <h1 style="font-size:20px;font-weight:800;margin-bottom:3px">${deptLabel} — Groups Report</h1>
        <p style="font-size:11px;opacity:0.8">Superior University · Group Management System</p>
      </div>
      <div style="text-align:right;font-size:11px;opacity:0.85">
        <p style="margin-bottom:3px">Generated: ${now}</p>
        <p>${selectedGroups.length} Group${selectedGroups.length!==1?'s':''} &nbsp;·&nbsp; ${totalMembers} Total Members</p>
      </div>
    </div>
  </div>

  <!-- Summary strip -->
  <div style="display:flex;border:1px solid #e8eaf0;border-top:none;margin-bottom:24px;border-radius:0 0 12px 12px">
    ${[
      ['Groups Selected', selectedGroups.length],
      ['Total Members',   totalMembers],
      ['Department',      deptLabel],
      ['Report Date',     now],
    ].map(([l,v],i,a) => `
      <div style="flex:1;padding:10px 16px;${i<a.length-1?'border-right:1px solid #e8eaf0':''}">
        <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:2px">${l}</p>
        <p style="font-size:13px;font-weight:700;color:#111827">${v}</p>
      </div>`).join('')}
  </div>

  <!-- Group Sections -->
  ${groupSections}

  <!-- Footer -->
  <div style="margin-top:24px;padding:14px 20px;border-top:2px solid #e8eaf0;display:flex;justify-content:space-between;align-items:center">
    <div>
      <p style="font-size:10px;font-weight:700;color:#4f46e5">UniGroups — Superior University</p>
      <p style="font-size:9px;color:#9ca3af;margin-top:1px">Group Management System · Admin Report · Confidential</p>
    </div>
    <p style="font-size:9px;color:#9ca3af">Generated on ${now}</p>
  </div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=960,height=750')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 600)
}
