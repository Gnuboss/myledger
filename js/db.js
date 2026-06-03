/* ════════════════════════════════════════════════════════
   DB — storage, load, save
   ════════════════════════════════════════════════════════ */

function persist()         { localStorage.setItem(STORE_KEY,    JSON.stringify(DB)); }
function persistSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); }

function todayStr()    { return new Date().toISOString().split('T')[0]; }
function addDays(n)    { return new Date(Date.now() + n * 86400000).toISOString().split('T')[0]; }
function isQuote(s)    { return ['quote','quote-sent','accepted','declined'].includes(s); }
function fmt(n)        { return '$' + Number(n||0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }

function nextId(type) {
  const prefix = type === 'quote' ? 'QUO' : 'INV';
  const nums   = DB.filter(d => d.id && d.id.startsWith(prefix))
                   .map(d => parseInt(d.id.replace(prefix + '-', '')) || 0);
  const next   = nums.length ? Math.max(...nums) + 1 : 1;
  return prefix + '-' + String(next).padStart(4, '0');
}

function setId(val) {
  const v = val || '—';
  document.getElementById('num-display').textContent  = v;
  document.getElementById('doc-type-id').textContent  = v;
  document.getElementById('crumb-id').textContent     = v;
  document.getElementById('p-id').textContent         = v;
}

function getDoc() {
  const totals = recalc();
  return {
    id:      CID,
    version: 1,
    type:    isQuote(document.getElementById('p-status').value) ? 'quote' : 'invoice',
    status:  document.getElementById('p-status').value,
    client: {
      name:    document.getElementById('to-name').textContent,
      company: document.getElementById('to-company').textContent,
      email:   document.getElementById('to-email').textContent,
      address: document.getElementById('to-addr').textContent,
    },
    from: {
      name:    document.getElementById('from-name').textContent,
      email:   document.getElementById('from-email').textContent,
      address: document.getElementById('from-addr').textContent,
    },
    issue_date:     document.getElementById('issue-date').value,
    due_date:       document.getElementById('due-date').value,
    currency:       document.getElementById('inv-curr').textContent,
    terms:          document.getElementById('inv-terms').textContent,
    notes:          document.getElementById('inv-notes').textContent,
    items:          getItems(),
    discount:       { amount: document.getElementById('p-disc').value, type: document.getElementById('p-disc-type').value },
    tax_rate:       document.getElementById('p-tax').value,
    paymentMethods: getSelectedPayMethods(),
    totals,
    updated_at: new Date().toISOString(),
  };
}

function saveDoc() {
  if (!CID) { toast('NO DOCUMENT LOADED'); return; }
  const doc = getDoc();
  const idx = DB.findIndex(d => d.id === CID);
  if (idx >= 0) {
    DB[idx] = { ...DB[idx], ...doc };
  } else {
    DB.unshift({ ...doc, created_at: new Date().toISOString() });
  }
  persist();
  renderList();
  toast('SAVED · ' + CID);
}

function loadDoc(id) {
  const doc = DB.find(d => d.id === id);
  if (!doc) return;
  CID = id;
  setId(id);

  document.getElementById('p-id').textContent       = id;
  document.getElementById('p-created').textContent  = doc.created_at
    ? new Date(doc.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
    : '—';

  document.getElementById('issue-date').value = doc.issue_date || todayStr();
  document.getElementById('due-date').value   = doc.due_date   || addDays(30);

  document.getElementById('to-name').textContent    = doc.client?.name    || 'Client Name';
  document.getElementById('to-company').textContent = doc.client?.company || 'Company / Studio';
  document.getElementById('to-email').textContent   = doc.client?.email   || 'client@company.com';
  document.getElementById('to-addr').textContent    = doc.client?.address || 'Client Address';

  document.getElementById('from-name').textContent  = doc.from?.name    || SETTINGS.fromName  || 'Your Name / Studio';
  document.getElementById('from-email').textContent = doc.from?.email   || SETTINGS.fromEmail || 'email@domain.com';
  document.getElementById('from-addr').textContent  = doc.from?.address || SETTINGS.fromAddr  || 'City, Country';

  document.getElementById('inv-notes').textContent = doc.notes    || 'Thank you for your business.';
  document.getElementById('inv-curr').textContent  = doc.currency || SETTINGS.currency || 'USD';
  document.getElementById('inv-terms').textContent = doc.terms    || SETTINGS.terms    || 'NET 30';

  document.getElementById('p-disc').value      = doc.discount?.amount || '';
  document.getElementById('p-disc-type').value = doc.discount?.type   || 'fixed';
  document.getElementById('p-tax').value       = doc.tax_rate          || SETTINGS.taxRate || '';
  document.getElementById('p-status').value    = doc.status || 'quote';

  applyStatus(doc.status || 'quote');

  const items = (doc.items && doc.items.length)
    ? doc.items
    : (isQuote(doc.status) ? SAMPLE_QUOTE_ITEMS : SAMPLE_INVOICE_ITEMS);
  renderItems(items);

  renderPayCheckboxes(doc.paymentMethods || []);
  renderList();
}

function startBlank(type) {
  const isQ = type === 'quote';
  CID = nextId(type);
  ROW_COUNTER = 0;
  setId(CID);

  document.getElementById('issue-date').value = todayStr();
  document.getElementById('due-date').value   = addDays(isQ ? (parseInt(SETTINGS.quoteDays) || 30) : 30);

  document.getElementById('to-name').textContent    = 'Client Name';
  document.getElementById('to-company').textContent = 'Company / Studio';
  document.getElementById('to-email').textContent   = 'client@company.com';
  document.getElementById('to-addr').textContent    = 'Client Address';

  document.getElementById('from-name').textContent  = SETTINGS.fromName  || 'Your Name / Studio';
  document.getElementById('from-email').textContent = SETTINGS.fromEmail || 'email@domain.com';
  document.getElementById('from-addr').textContent  = SETTINGS.fromAddr  || 'City, Country';

  document.getElementById('inv-notes').textContent = isQ
    ? 'This quote is valid for the period stated. Please confirm in writing to proceed.'
    : 'Thank you for your business. Please include invoice number with payment.';
  document.getElementById('inv-curr').textContent  = SETTINGS.currency || 'USD';
  document.getElementById('inv-terms').textContent = SETTINGS.terms    || 'NET 30';
  document.getElementById('p-disc').value      = '';
  document.getElementById('p-tax').value       = SETTINGS.taxRate || '';
  document.getElementById('p-status').value    = isQ ? 'quote' : 'draft';
  document.getElementById('p-created').textContent = todayStr();

  applyStatus(isQ ? 'quote' : 'draft');
  renderItems(isQ ? SAMPLE_QUOTE_ITEMS : SAMPLE_INVOICE_ITEMS);
  renderPayCheckboxes([]);

  DB.unshift({ id: CID, type, status: isQ ? 'quote' : 'draft', client: { name: 'Client Name' }, totals: { total: 0 }, created_at: new Date().toISOString() });
  persist();
  renderList();
  closeMobPanel();
}

function duplicateDoc() {
  const doc  = getDoc();
  const type = isQuote(doc.status) ? 'quote' : 'invoice';
  const newId = nextId(type);
  DB.unshift({ ...doc, id: newId, status: type === 'quote' ? 'quote' : 'draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  persist();
  loadDoc(newId);
  toast('DUPLICATED → ' + newId);
}

function deleteDoc() {
  if (!CID) return;
  if (!confirm('Delete ' + CID + '? This cannot be undone.')) return;
  DB = DB.filter(d => d.id !== CID);
  persist();
  closeMobPanel();
  if (DB.length) { loadDoc(DB[0].id); } else { startBlank('quote'); }
  toast('DELETED');
}

function markAccepted() {
  saveDoc();
  const idx = DB.findIndex(d => d.id === CID);
  if (idx >= 0) { DB[idx].status = 'accepted'; persist(); }
  document.getElementById('p-status').value = 'accepted';
  applyStatus('accepted');
  renderList();
  toast('MARKED ACCEPTED');
}

function markDeclined() {
  saveDoc();
  const idx = DB.findIndex(d => d.id === CID);
  if (idx >= 0) { DB[idx].status = 'declined'; persist(); }
  document.getElementById('p-status').value = 'declined';
  applyStatus('declined');
  renderList();
  toast('MARKED DECLINED');
}

function convertToInvoice() {
  saveDoc();
  const src   = DB.find(d => d.id === CID);
  if (!src) return;
  const newId = nextId('invoice');
  const inv   = { ...src, id: newId, type: 'invoice', status: 'draft', source_quote: CID, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), due_date: addDays(30), notes: 'Thank you for your business. Please include invoice number with payment.' };
  const qIdx  = DB.findIndex(d => d.id === CID);
  if (qIdx >= 0) { DB[qIdx].status = 'accepted'; DB[qIdx].converted_to = newId; }
  DB.unshift(inv);
  persist();
  loadDoc(newId);
  toast('CONVERTED → ' + newId);
}

function printDoc() {
  saveDoc();
  const clientRaw = document.getElementById('to-name')?.textContent || '';
  const client    = clientRaw.replace(/[^a-zA-Z0-9\s]/g,'').trim().replace(/\s+/g,'-') || 'Client';
  const prev      = document.title;
  document.title  = (CID || 'DOC') + '_' + client + '_' + todayStr();
  setTimeout(() => { window.print(); setTimeout(() => { document.title = prev; }, 1000); }, 200);
}

function exportJSON() {
  const blob = new Blob([JSON.stringify({ docs: DB, settings: SETTINGS, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'myledger-backup-' + todayStr() + '.json';
  a.click();
  toast('JSON EXPORTED');
}

function importJSON(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (Array.isArray(data))    { DB = data; }
      else if (data.docs)         { DB = data.docs; if (data.settings) { SETTINGS = data.settings; persistSettings(); } }
      else if (data.invoices)     { DB = data.invoices; }
      DB = DB.filter(d => d && d.id);
      persist();
      if (DB.length) loadDoc(DB[0].id);
      toast('IMPORTED · ' + DB.length + ' DOCS');
    } catch { toast('IMPORT FAILED — INVALID JSON'); }
  };
  r.readAsText(f);
  e.target.value = '';
}
