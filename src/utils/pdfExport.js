export function generateDeptPDF(selectedGroups, dept) {
  const now      = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' })
  const deptMap  = { SE: 'Software Engineering', CS: 'Computer Science' }
  const deptLabel = dept ? deptMap[dept] : 'All Departments'
  const totalMembers = selectedGroups.reduce((s, g) => s + (g.members?.length || 0), 0)

  const groupSections = selectedGroups.map((group, gi) => {
    const d       = deptMap[group.department] || group.department
    const mc      = group.members?.length || 0
    const accent  = group.department === 'SE' ? '#f97316' : '#06b6d4'

    const rows = (group.members || []).map((m, i) => {
      const name   = m.user?.name || '—'
      const roll   = m.user?.roll_number || '—'
      const role   = m.role === 'leader' ? 'Group Leader' : 'Member'
      const joined = m.joined_at ? new Date(m.joined_at).toLocaleDateString('en-PK') : '—'
      const rowBg  = i % 2 === 0 ? '#1a1a1a' : '#141414'
      return `
        <tr style="background:${rowBg}">
          <td style="padding:9px 14px;border-bottom:1px solid #2a2a2a;font-size:11px;color:#666;font-weight:600;width:36px">${i + 1}</td>
          <td style="padding:9px 14px;border-bottom:1px solid #2a2a2a">
            <div style="font-size:12px;font-weight:700;color:#f0f0f0">${name}</div>
            <div style="font-size:10px;color:${accent};font-family:monospace;margin-top:2px;letter-spacing:0.5px">${roll}</div>
          </td>
          <td style="padding:9px 14px;border-bottom:1px solid #2a2a2a;text-align:center">
            <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;
              background:${m.role === 'leader' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)'};
              color:${m.role === 'leader' ? '#f59e0b' : '#818cf8'};
              border:1px solid ${m.role === 'leader' ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}">
              ${role}
            </span>
          </td>
          <td style="padding:9px 14px;border-bottom:1px solid #2a2a2a;font-size:11px;color:#666;text-align:center">${joined}</td>
        </tr>`
    }).join('')

    const emptyRow = mc === 0
      ? `<tr><td colspan="4" style="padding:24px;text-align:center;color:#555;font-size:12px;font-style:italic">No members yet</td></tr>`
      : ''

    return `
      <div style="margin-bottom:32px;page-break-inside:avoid">
        <!-- Group header -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;
          background:#1a1a1a;border:1px solid #2a2a2a;border-left:4px solid ${accent};
          border-radius:10px 10px 0 0">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
              <span style="font-size:15px;font-weight:800;color:#ffffff;letter-spacing:-0.3px">${group.name}</span>
              <span style="padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;
                background:${group.status === 'open' ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.2)'};
                color:${group.status === 'open' ? '#22c55e' : '#94a3b8'};
                border:1px solid ${group.status === 'open' ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.3)'}">
                ${group.status === 'open' ? 'Open' : 'Locked'}
              </span>
            </div>
            <span style="font-size:11px;color:#666">${d} &nbsp;·&nbsp; Created ${group.created_at?.split('T')[0] || '—'}</span>
          </div>
          <div style="text-align:center;min-width:56px;background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:8px 14px">
            <div style="font-size:22px;font-weight:800;color:${accent};line-height:1">${mc}</div>
            <div style="font-size:9px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-top:2px">/ ${group.max_members}</div>
          </div>
        </div>

        <!-- Members table -->
        <table style="width:100%;border-collapse:collapse;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 10px 10px;overflow:hidden">
          <thead>
            <tr style="background:#111">
              <th style="padding:9px 14px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#555;border-bottom:1px solid #2a2a2a">#</th>
              <th style="padding:9px 14px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#555;border-bottom:1px solid #2a2a2a">Student</th>
              <th style="padding:9px 14px;text-align:center;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#555;border-bottom:1px solid #2a2a2a">Role</th>
              <th style="padding:9px 14px;text-align:center;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#555;border-bottom:1px solid #2a2a2a">Joined</th>
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
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#0d0d0d; color:#f0f0f0; }
    @page { margin: 14mm 12mm; size: A4; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-break { page-break-inside: avoid; }
    }
  </style>
</head>
<body style="padding:0;background:#0d0d0d">

  <!-- Header -->
  <div style="background:#111;border:1px solid #222;border-bottom:3px solid #6366f1;border-radius:12px 12px 0 0;padding:24px 28px;margin-bottom:0">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <div style="width:34px;height:34px;background:#6366f1;border-radius:9px;display:flex;align-items:center;justify-content:center">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <span style="font-size:13px;font-weight:800;color:#a5b4fc;letter-spacing:1px;text-transform:uppercase">UniGroups</span>
        </div>
        <h1 style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;margin-bottom:4px">${deptLabel}</h1>
        <p style="font-size:11px;color:#555;letter-spacing:0.3px">Superior University &nbsp;·&nbsp; Group Management System</p>
      </div>
      <div style="text-align:right">
        <p style="font-size:10px;color:#555;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.8px">Generated</p>
        <p style="font-size:13px;font-weight:700;color:#f0f0f0">${now}</p>
      </div>
    </div>
  </div>

  <!-- Stats strip -->
  <div style="display:flex;background:#111;border:1px solid #222;border-top:none;margin-bottom:28px;border-radius:0 0 12px 12px">
    ${[
      ['Groups', selectedGroups.length, '#6366f1'],
      ['Members', totalMembers, '#22c55e'],
      ['Department', deptLabel, '#f59e0b'],
      ['Date', now, '#06b6d4'],
    ].map(([l, v, c], i, a) => `
      <div style="flex:1;padding:12px 18px;${i < a.length - 1 ? 'border-right:1px solid #222' : ''}">
        <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#444;margin-bottom:4px">${l}</p>
        <p style="font-size:14px;font-weight:800;color:${c}">${v}</p>
      </div>`).join('')}
  </div>

  <!-- Group Sections -->
  ${groupSections}

  <!-- Footer -->
  <div style="margin-top:28px;padding:14px 20px;border-top:1px solid #222;display:flex;justify-content:space-between;align-items:center">
    <div>
      <p style="font-size:10px;font-weight:700;color:#6366f1">UniGroups — Superior University</p>
      <p style="font-size:9px;color:#444;margin-top:2px">Group Management System · Admin Report · Confidential</p>
    </div>
    <p style="font-size:9px;color:#444">${now}</p>
  </div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=960,height=750')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 600)
}
