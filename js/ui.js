/* ════════════════════════════════════════════════════════
   UI — views, list, toggles, sheets, overlay, toast
   ════════════════════════════════════════════════════════ */

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

/* ── VIEW ROUTING ──────────────────────────────────────── */
function showView(v) {
  ['invoices','clients','settings'].forEach(name => {
    const el = document.getElementById('view-' + name);
    if (el) el.style.display = name === v ? (name === 'invoices' ? 'flex' : 'flex') : 'none';
  });
  document.querySelectorAll('.tn').forEach(n => n.classList.toggle('active', n.dataset.v === v));
  if (v === 'settings') { loadSettingsForm(); updateStorageInfo(); }
  if (v === 'clients')  renderClientList();
}

/* ── SIDEBAR LIST ──────────────────────────────────────── */
function filterList(f) {
  LIST_FILTER = f;
  document.querySelectorAll('.sf').forEach(b => b.classList.toggle('active', b.dataset.f === f));
  renderList();
}

function renderList() {
  const list = document.getElementById('inv-list');
  let visible = DB;
  if (LIST_FILTER === 'quote')   visible = DB.filter(d =>  isQuote(d.status));
  if (LIST_FILTER === 'invoice') visible = DB.filter(d => !isQuote(d.status));

  if (!visible.length) {
    list.innerHTML = '<div style="padding:14px 12px;font-family:var(--mono);font-size:9px;color:#999;letter-spacing:0.06em;line-height:1.8">NOTHING HERE YET.</div>';
    return;
  }
  list.innerHTML = visible.map(doc => {
    const sc      = STATUS_CLASS[doc.status] || 's-draft';
    const typeTag = isQuote(doc.status) ? 'QUOTE' : 'INVOICE';
    return `<div class="ili${doc.id === CID ? ' active' : ''}" onclick="loadDoc('${doc.id}')">
      <div class="ili-type">${typeTag}</div>
      <div class="ili-id">${doc.id}</div>
      <div class="ili-client">${doc.client?.name || '—'}</div>
      <div class="ili-foot">
        <span class="ili-amt">${fmt(doc.totals?.total || 0)}</span>
        <span class="ili-badge ${sc}">${STATUS_LABEL[doc.status] || doc.status}</span>
      </div>
    </div>`;
  }).join('');
}

/* ── CLIENTS VIEW ──────────────────────────────────────── */
function renderClientList() {
  const seen = {};
  DB.forEach(doc => {
    const n = doc.client?.name;
    if (!n || n === 'Client Name') return;
    if (!seen[n]) seen[n] = { name: n, company: doc.client?.company || '', email: doc.client?.email || '', quotes: 0, invoices: 0, total: 0 };
    if (isQuote(doc.status)) seen[n].quotes++;
    else { seen[n].invoices++; seen[n].total += doc.totals?.total || 0; }
  });
  const clients = Object.values(seen);
  const el = document.getElementById('client-list-view');
  if (!el) return;
  if (!clients.length) {
    el.innerHTML = '<div style="font-family:var(--mono);font-size:9px;color:var(--ink4);letter-spacing:0.06em">NO CLIENTS YET.</div>';
    return;
  }
  el.innerHTML = '<div class="client-grid">' + clients.map(c =>
    `<div class="client-card">
      <div class="cc-name">${c.name}</div>
      <div class="cc-company">${c.company}</div>
      <div class="cc-email">${c.email}</div>
      <div class="cc-foot">
        <span>${c.quotes} QUOTE${c.quotes !== 1 ? 'S' : ''} · ${c.invoices} INV</span>
        <span>${fmt(c.total)}</span>
      </div>
    </div>`
  ).join('') + '</div>';
}

/* ── PANEL TOGGLES ─────────────────────────────────────── */
function toggleSidebar() {
  const sb  = document.querySelector('.sidebar');
  const btn = document.getElementById('btn-toggle-sidebar');
  const isMobile = window.innerWidth <= 640;
  if (isMobile) {
    const open = sb.classList.toggle('open');
    btn.textContent = open ? '✕' : '☰';
    if (open) document.querySelector('.panel').classList.remove('open');
  } else {
    const collapsed = sb.classList.toggle('collapsed');
    btn.textContent = collapsed ? '☰›' : '☰';
  }
}

function togglePanel() {
  const panel = document.querySelector('.panel');
  const btn   = document.getElementById('btn-toggle-panel');
  const isMobile = window.innerWidth <= 640;
  if (isMobile) {
    const open = panel.classList.toggle('open');
    btn.textContent = open ? '✕ OPTIONS' : 'OPTIONS ▸';
    if (open) document.querySelector('.sidebar').classList.remove('open');
  } else {
    const collapsed = panel.classList.toggle('collapsed');
    btn.textContent = collapsed ? '‹ OPTIONS' : 'OPTIONS ▸';
  }
}

/* close mobile panels when tapping doc area */
function initDocAreaTap() {
  document.querySelector('.doc-area')?.addEventListener('click', () => {
    if (window.innerWidth > 640) return;
    document.querySelector('.sidebar').classList.remove('open');
    document.querySelector('.panel').classList.remove('open');
    document.getElementById('btn-toggle-sidebar').textContent = '☰';
    document.getElementById('btn-toggle-panel').textContent   = 'OPTIONS ▸';
  });
}

/* ── NEW DOCUMENT SHEET ────────────────────────────────── */
function showNewMenu() {
  const sheet = document.getElementById('mob-sheet');
  sheet.innerHTML = `
    <div class="mob-sheet-head">
      <span class="mob-sheet-title">New Document</span>
      <button class="mob-close" onclick="closeMobPanel()">CLOSE ×</button>
    </div>
    <p style="font-family:var(--mono);font-size:9px;color:var(--ink4);letter-spacing:0.06em;margin-bottom:16px;line-height:1.9">
      START WITH A QUOTE FOR CLIENT APPROVAL,<br>THEN CONVERT TO A FORMAL INVOICE.
    </p>
    <button class="mob-btn blue"    onclick="startBlank('quote');  closeMobPanel()">NEW QUOTE</button>
    <button class="mob-btn primary" onclick="startBlank('invoice');closeMobPanel()">NEW INVOICE (DIRECT)</button>`;
  document.getElementById('mob-overlay').classList.add('show');
}

/* ── MOBILE OPTIONS SHEET ──────────────────────────────── */
function showMobOptions() {
  const s        = document.getElementById('p-status').value;
  const disc     = document.getElementById('p-disc').value;
  const discType = document.getElementById('p-disc-type').value;
  const tax      = document.getElementById('p-tax').value;
  const isSent   = s === 'quote-sent';
  const isAcc    = s === 'accepted';

  document.getElementById('mob-sheet').innerHTML = `
    <div class="mob-sheet-head">
      <span class="mob-sheet-title">Document Options</span>
      <button class="mob-close" onclick="closeMobPanel()">CLOSE ×</button>
    </div>
    <span class="lbl" style="margin-bottom:6px">Status</span>
    <select id="mp-status" style="width:100%;font-family:var(--mono);font-size:11px;padding:8px;border:var(--b);background:var(--paper);margin-bottom:14px"
      onchange="applyStatus(this.value);document.getElementById('p-status').value=this.value">
      <optgroup label="Quote">
        <option value="quote"${s==='quote'?' selected':''}>Quote — Draft</option>
        <option value="quote-sent"${s==='quote-sent'?' selected':''}>Quote — Sent</option>
        <option value="accepted"${s==='accepted'?' selected':''}>Quote — Accepted</option>
        <option value="declined"${s==='declined'?' selected':''}>Quote — Declined</option>
      </optgroup>
      <optgroup label="Invoice">
        <option value="draft"${s==='draft'?' selected':''}>Invoice — Draft</option>
        <option value="pending"${s==='pending'?' selected':''}>Invoice — Sent</option>
        <option value="paid"${s==='paid'?' selected':''}>Invoice — Paid</option>
        <option value="overdue"${s==='overdue'?' selected':''}>Invoice — Overdue</option>
        <option value="void"${s==='void'?' selected':''}>Void</option>
      </optgroup>
    </select>
    <span class="lbl" style="margin-bottom:6px">Invoice Discount</span>
    <input type="number" class="mob-input" value="${disc}" placeholder="Amount"
      oninput="document.getElementById('p-disc').value=this.value;recalc()">
    <select style="width:100%;font-family:var(--mono);font-size:11px;padding:8px;border:var(--b);background:var(--paper);margin-bottom:14px"
      onchange="document.getElementById('p-disc-type').value=this.value;recalc()">
      <option value="fixed"${discType==='fixed'?' selected':''}>Fixed $</option>
      <option value="pct"${discType==='pct'?' selected':''}>Percentage %</option>
    </select>
    <span class="lbl" style="margin-bottom:6px">Tax Rate %</span>
    <input type="number" class="mob-input" value="${tax}" placeholder="e.g. 10"
      oninput="document.getElementById('p-tax').value=this.value;recalc()">
    <div style="margin-top:8px"></div>
    ${isSent ? `
      <button class="mob-btn" style="background:#27ae60;color:#fff;border-color:#27ae60" onclick="markAccepted();closeMobPanel()">MARK ACCEPTED</button>
      <button class="mob-btn danger" onclick="markDeclined();closeMobPanel()">MARK DECLINED</button>` : ''}
    ${isAcc  ? `<button class="mob-btn blue" onclick="convertToInvoice();closeMobPanel()">CONVERT TO INVOICE</button>` : ''}
    <button class="mob-btn primary" onclick="saveDoc();closeMobPanel()">SAVE</button>
    <button class="mob-btn dark"    onclick="printDoc()">EXPORT / PRINT</button>
    <button class="mob-btn"         onclick="duplicateDoc();closeMobPanel()">DUPLICATE</button>
    <button class="mob-btn danger"  onclick="deleteDoc()">DELETE</button>`;
  document.getElementById('mob-overlay').classList.add('show');
}

/* ── MOBILE LIST SHEET ─────────────────────────────────── */
function showMobList() {
  const rows = DB.map(doc => {
    const sc      = STATUS_CLASS[doc.status] || 's-draft';
    const typeTag = isQuote(doc.status) ? 'QUOTE' : 'INVOICE';
    return `<div class="mob-inv-row${doc.id===CID?' active-row':''}" onclick="loadDoc('${doc.id}');closeMobPanel()">
      <div style="font-family:var(--mono);font-size:8px;color:var(--ink4);text-transform:uppercase;margin-bottom:2px">${typeTag}</div>
      <div style="font-family:var(--mono);font-size:13px;font-weight:500">${doc.id}</div>
      <div style="font-size:12px;color:var(--ink3);margin:2px 0">${doc.client?.name || '—'}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px">
        <span style="font-family:var(--mono);font-size:12px">${fmt(doc.totals?.total||0)}</span>
        <span class="ili-badge ${sc}">${STATUS_LABEL[doc.status]||doc.status}</span>
      </div>
    </div>`;
  }).join('');
  document.getElementById('mob-sheet').innerHTML = `
    <div class="mob-sheet-head">
      <span class="mob-sheet-title">All Documents (${DB.length})</span>
      <button class="mob-close" onclick="closeMobPanel()">CLOSE ×</button>
    </div>
    ${rows || '<div style="font-family:var(--mono);font-size:10px;color:var(--ink4)">Nothing yet. Tap NEW to start.</div>'}`;
  document.getElementById('mob-overlay').classList.add('show');
}

function closeMobPanel() { document.getElementById('mob-overlay').classList.remove('show'); }
function handleOverlayClick(e) { if (e.target === document.getElementById('mob-overlay')) closeMobPanel(); }

/* ── WELCOME OVERLAY ───────────────────────────────────── */
function dismissWelcome() {
  localStorage.setItem(SEEN_KEY, '1');
  document.getElementById('welcome-overlay').classList.add('hidden');
}
function handleWelcomeClick(e) {
  if (e.target === document.getElementById('welcome-overlay')) dismissWelcome();
}

function dismissBanner() {
  sessionStorage.setItem(BANNER_KEY, '1');
  document.getElementById('demo-banner').classList.remove('show');
}

function initBannerAndWelcome() {
  const isRemote = location.protocol === 'https:' || location.protocol === 'http:';

  if (isRemote) {
    const dlUrl = location.href;
    document.getElementById('demo-dl-btn')?.setAttribute('href', dlUrl);
    document.getElementById('wc-dl-btn')?.setAttribute('href', dlUrl);
    document.getElementById('wc-demo-note-wrap').innerHTML = `
      <div class="wc-demo-note">
        <strong>⚠ PUBLIC DEMO</strong>
        Data is stored in this browser only — it will be lost if you clear your browser
        data or switch devices. Download MyLedger and open it locally for permanent, private storage.
      </div>`;
    document.getElementById('wc-dl-btn').style.display = 'inline-flex';
    if (!sessionStorage.getItem(BANNER_KEY)) {
      document.getElementById('demo-banner').classList.add('show');
    }
  }

  if (!localStorage.getItem(SEEN_KEY)) {
    document.getElementById('welcome-overlay').classList.remove('hidden');
  }
}
