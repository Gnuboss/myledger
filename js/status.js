/* ════════════════════════════════════════════════════════
   STATUS — apply status, stamps, flow tracker
   ════════════════════════════════════════════════════════ */

function applyStatus(s) {
  document.getElementById('p-status').value = s;

  const pill = document.getElementById('status-pill');
  pill.className  = 'status-pill ' + (STATUS_CLASS[s] || 's-draft');
  pill.textContent = STATUS_LABEL[s] || s.toUpperCase();

  const isQ = isQuote(s);
  document.getElementById('doc-type-label').textContent = isQ ? 'QUOTATION' : 'INVOICE';
  document.getElementById('doc-type-id').textContent    = CID || '—';
  document.getElementById('date1-label').textContent    = 'Date';
  document.getElementById('date2-label').textContent    = isQ ? 'Valid Until' : 'Due Date';
  document.getElementById('notes-label').textContent    = isQ ? 'Notes / Scope Clarifications' : 'Notes / Payment Instructions';

  // Acceptance banner
  const banner = document.getElementById('acceptance-banner');
  banner.classList.toggle('show', s === 'quote-sent');

  // Convert button
  const cvt = s === 'accepted';
  document.getElementById('convert-btn').style.display       = cvt ? '' : 'none';
  document.getElementById('panel-convert-btn').style.display = cvt ? '' : 'none';

  renderStamp(s);
  updateFlowSteps(s);
}

function renderStamp(s) {
  const stamp = document.getElementById('stamp');
  stamp.innerHTML = '';
  stamp.classList.remove('show');

  const stamps = {
    paid:     { color: '#27ae60', text: 'PAID',     size: 46 },
    overdue:  { color: '#c0392b', text: 'OVERDUE',  size: 28 },
    accepted: { color: '#16a085', text: 'ACCEPTED', size: 26 },
    declined: { color: '#888',    text: 'DECLINED', size: 25 },
    void:     { color: '#888',    text: 'VOID',      size: 34 },
  };

  if (!stamps[s]) return;
  const { color, text, size } = stamps[s];
  stamp.classList.add('show');

  const diag = (s === 'declined' || s === 'void')
    ? `<line x1="5" y1="8" x2="205" y2="97" stroke="${color}" stroke-width="3" opacity="0.5"/>
       <line x1="205" y1="8" x2="5" y2="97" stroke="${color}" stroke-width="3" opacity="0.5"/>`
    : '';

  stamp.innerHTML = `
    ${diag}
    <rect x="5" y="8" width="200" height="89" rx="6" fill="none" stroke="${color}" stroke-width="5.5" opacity="0.8"/>
    <text x="105" y="64" font-family="IBM Plex Mono,monospace" font-size="${size}" font-weight="600"
      fill="${color}" text-anchor="middle" opacity="0.8">${text}</text>`;
}

function updateFlowSteps(s) {
  const doneFor = {
    'flow-quote':    ['quote-sent','accepted','declined','draft','pending','paid','overdue'],
    'flow-accepted': ['accepted','draft','pending','paid','overdue'],
    'flow-invoiced': ['draft','pending','paid','overdue'],
    'flow-paid':     ['paid'],
  };
  const activeFor = {
    'quote':       'flow-quote',
    'quote-sent':  'flow-quote',
    'accepted':    'flow-accepted',
    'declined':    'flow-quote',
    'draft':       'flow-invoiced',
    'pending':     'flow-invoiced',
    'paid':        'flow-paid',
    'overdue':     'flow-invoiced',
    'void':        'flow-invoiced',
  };

  Object.keys(doneFor).forEach(id => {
    const el  = document.getElementById(id); if (!el) return;
    const dot = el.querySelector('.fs-dot');
    const lbl = el.querySelector('.fs-label');
    const done   = doneFor[id].includes(s);
    const active = activeFor[s] === id && !done;
    dot.classList.toggle('done',   done);
    dot.classList.toggle('active', active);
    lbl.classList.toggle('done',   done);
    lbl.classList.toggle('active', active);
  });
}
