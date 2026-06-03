/* ════════════════════════════════════════════════════════
   SETTINGS — profile form, storage info
   ════════════════════════════════════════════════════════ */

function switchSettingsTab(tab) {
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.stab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.stab[data-tab="${tab}"]`)?.classList.add('active');
  document.getElementById('stab-' + tab)?.classList.add('active');
  if (tab === 'payment') loadPaymentForm();
  if (tab === 'data')    updateStorageInfo();
}

function loadSettingsForm() {
  document.getElementById('s-from-name').value  = SETTINGS.fromName   || '';
  document.getElementById('s-from-email').value = SETTINGS.fromEmail  || '';
  document.getElementById('s-from-addr').value  = SETTINGS.fromAddr   || '';
  document.getElementById('s-currency').value   = SETTINGS.currency   || 'USD';
  document.getElementById('s-terms').value      = SETTINGS.terms      || 'NET 30';
  document.getElementById('s-tax').value        = SETTINGS.taxRate    || '';
  document.getElementById('s-quote-days').value = SETTINGS.quoteDays  || '30';
}

function saveSettings() {
  SETTINGS.fromName   = document.getElementById('s-from-name').value;
  SETTINGS.fromEmail  = document.getElementById('s-from-email').value;
  SETTINGS.fromAddr   = document.getElementById('s-from-addr').value;
  SETTINGS.currency   = document.getElementById('s-currency').value   || 'USD';
  SETTINGS.terms      = document.getElementById('s-terms').value      || 'NET 30';
  SETTINGS.taxRate    = document.getElementById('s-tax').value;
  SETTINGS.quoteDays  = document.getElementById('s-quote-days').value || '30';
  persistSettings();
  document.getElementById('settings-saved-note').textContent = 'SAVED ✓';
  setTimeout(() => { document.getElementById('settings-saved-note').textContent = ''; }, 2000);
  toast('SETTINGS SAVED');
}

function updateStorageInfo() {
  const raw     = localStorage.getItem(STORE_KEY) || '[]';
  const kb      = (new Blob([raw]).size / 1024).toFixed(1);
  const paid    = DB.filter(d => d.status === 'paid').reduce((s,d) => s + (d.totals?.total || 0), 0);
  const pending = DB.filter(d => d.status === 'pending').reduce((s,d) => s + (d.totals?.total || 0), 0);
  const quotes  = DB.filter(d => isQuote(d.status)).length;
  const invs    = DB.filter(d => !isQuote(d.status)).length;
  const el      = document.getElementById('storage-info');
  if (el) el.innerHTML =
    `STORAGE: localStorage<br>` +
    `DOCUMENTS: ${DB.length} (${quotes} quotes · ${invs} invoices)<br>` +
    `PAID: ${fmt(paid)} · PENDING: ${fmt(pending)}<br>` +
    `DISK: ${kb} KB used<br><br>` +
    `NO ACCOUNTS · NO CLOUD · NO SUBSCRIPTIONS<br>` +
    `ALL DATA ON YOUR DEVICE`;
}
