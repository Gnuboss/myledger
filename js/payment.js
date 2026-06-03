/* ════════════════════════════════════════════════════════
   PAYMENT — settings form, checkboxes, doc block
   ════════════════════════════════════════════════════════ */

function setToggle(key, on) {
  const el = document.getElementById('pt-' + key);
  if (!el) return;
  el.classList.toggle('on', !!on);
  el.onclick = e => { e.stopPropagation(); el.classList.toggle('on'); };
}

function togglePayMethod(key) {
  document.getElementById('pm-' + key)?.classList.toggle('open');
}

function savePaymentSettings() {
  SETTINGS.payment = {
    bank: {
      enabled: document.getElementById('pt-bank').classList.contains('on'),
      name:    document.getElementById('pm-bank-name').value,
      bank:    document.getElementById('pm-bank-bank').value,
      account: document.getElementById('pm-bank-account').value,
      iban:    document.getElementById('pm-bank-iban').value,
      swift:   document.getElementById('pm-bank-swift').value,
      sort:    document.getElementById('pm-bank-sort').value,
      ref:     document.getElementById('pm-bank-ref').value,
    },
    wise: {
      enabled: document.getElementById('pt-wise').classList.contains('on'),
      name:    document.getElementById('pm-wise-name').value,
      link:    document.getElementById('pm-wise-link').value,
      email:   document.getElementById('pm-wise-email').value,
    },
    paypal: {
      enabled: document.getElementById('pt-paypal').classList.contains('on'),
      name:    document.getElementById('pm-paypal-name').value,
      email:   document.getElementById('pm-paypal-email').value,
      link:    document.getElementById('pm-paypal-link').value,
    },
    crypto: {
      enabled:  document.getElementById('pt-crypto').classList.contains('on'),
      currency: document.getElementById('pm-crypto-currency').value,
      network:  document.getElementById('pm-crypto-network').value,
      address:  document.getElementById('pm-crypto-address').value,
      note:     document.getElementById('pm-crypto-note').value,
    },
  };
  persistSettings();
  renderPayCheckboxes(getSelectedPayMethods());
  document.getElementById('pay-saved-note').textContent = 'SAVED ✓';
  setTimeout(() => { document.getElementById('pay-saved-note').textContent = ''; }, 2000);
  toast('PAYMENT SETTINGS SAVED');
}

function loadPaymentForm() {
  const p = SETTINGS.payment || {};
  const b = p.bank   || {};
  const w = p.wise   || {};
  const pp= p.paypal || {};
  const c = p.crypto || {};

  setToggle('bank',   b.enabled);
  document.getElementById('pm-bank-name').value    = b.name    || '';
  document.getElementById('pm-bank-bank').value    = b.bank    || '';
  document.getElementById('pm-bank-account').value = b.account || '';
  document.getElementById('pm-bank-iban').value    = b.iban    || '';
  document.getElementById('pm-bank-swift').value   = b.swift   || '';
  document.getElementById('pm-bank-sort').value    = b.sort    || '';
  document.getElementById('pm-bank-ref').value     = b.ref     || '';
  if (b.enabled) document.getElementById('pm-bank').classList.add('open');

  setToggle('wise',   w.enabled);
  document.getElementById('pm-wise-name').value  = w.name  || '';
  document.getElementById('pm-wise-link').value  = w.link  || '';
  document.getElementById('pm-wise-email').value = w.email || '';
  if (w.enabled) document.getElementById('pm-wise').classList.add('open');

  setToggle('paypal', pp.enabled);
  document.getElementById('pm-paypal-name').value  = pp.name  || '';
  document.getElementById('pm-paypal-email').value = pp.email || '';
  document.getElementById('pm-paypal-link').value  = pp.link  || '';
  if (pp.enabled) document.getElementById('pm-paypal').classList.add('open');

  setToggle('crypto', c.enabled);
  document.getElementById('pm-crypto-currency').value = c.currency || '';
  document.getElementById('pm-crypto-network').value  = c.network  || '';
  document.getElementById('pm-crypto-address').value  = c.address  || '';
  document.getElementById('pm-crypto-note').value     = c.note     || '';
  if (c.enabled) document.getElementById('pm-crypto').classList.add('open');
}

function getSelectedPayMethods() {
  return PAY_METHODS.filter(k => {
    const cb = document.getElementById('pc-' + k);
    return cb && cb.checked;
  });
}

function renderPayCheckboxes(selected) {
  selected = selected || [];
  const p       = SETTINGS.payment || {};
  const enabled = PAY_METHODS.filter(k => p[k]?.enabled);
  const wrap    = document.getElementById('pay-checks');
  const list    = document.getElementById('pay-check-list');
  if (!enabled.length) { wrap.style.display = 'none'; renderPayBlock([]); return; }
  wrap.style.display = 'block';
  const labels = { bank:'Bank Transfer', wise:'Wise', paypal:'PayPal', crypto:'Crypto' };
  list.innerHTML = enabled.map(k =>
    `<label class="pay-check-row">
      <input type="checkbox" id="pc-${k}" ${selected.includes(k) ? 'checked' : ''} onchange="renderPayBlock(getSelectedPayMethods())">
      <span class="pay-check-label">${labels[k]}</span>
    </label>`
  ).join('');
  renderPayBlock(selected);
}

function renderPayBlock(selected) {
  selected = selected || [];
  const block = document.getElementById('pay-block');
  const grid  = document.getElementById('pay-methods-grid');
  const title = document.getElementById('pay-block-title');
  const p     = SETTINGS.payment || {};
  const isQ   = isQuote(document.getElementById('p-status').value);

  if (!selected.length) { block.classList.remove('show'); return; }
  block.classList.add('show');
  title.textContent = isQ ? 'Payment Options (Upon Acceptance)' : 'Payment Details';

  grid.innerHTML = selected.map(k => {
    const m = p[k] || {};
    if (k === 'bank') {
      const rows = [
        m.name    ? `<div class="pay-card-row">Recipient: <span>${m.name}</span></div>`    : '',
        m.bank    ? `<div class="pay-card-row">Bank: <span>${m.bank}</span></div>`          : '',
        m.account ? `<div class="pay-card-row">Account: <span>${m.account}</span></div>`   : '',
        m.iban    ? `<div class="pay-card-row">IBAN: <span>${m.iban}</span></div>`          : '',
        m.swift   ? `<div class="pay-card-row">SWIFT/BIC: <span>${m.swift}</span></div>`   : '',
        m.sort    ? `<div class="pay-card-row">Sort Code: <span>${m.sort}</span></div>`     : '',
        m.ref     ? `<div class="pay-card-row" style="color:var(--ink3);font-style:italic;margin-top:4px">${m.ref}</div>` : '',
      ].filter(Boolean).join('');
      return `<div class="pay-card"><div class="pay-card-label">Bank Transfer</div>${rows}</div>`;
    }
    if (k === 'wise') return `<div class="pay-card"><div class="pay-card-label">Wise</div>
      ${m.name  ? `<div class="pay-card-row">Recipient: <span>${m.name}</span></div>` : ''}
      ${m.email ? `<div class="pay-card-row">Email: <span>${m.email}</span></div>`    : ''}
      ${m.link  ? `<div class="pay-card-row"><a class="pay-card-link" href="${m.link}">${m.link}</a></div>` : ''}
    </div>`;
    if (k === 'paypal') return `<div class="pay-card"><div class="pay-card-label">PayPal</div>
      ${m.name  ? `<div class="pay-card-row">Recipient: <span>${m.name}</span></div>` : ''}
      ${m.email ? `<div class="pay-card-row">Email: <span>${m.email}</span></div>`    : ''}
      ${m.link  ? `<div class="pay-card-row"><a class="pay-card-link" href="${m.link}">${m.link}</a></div>` : ''}
    </div>`;
    if (k === 'crypto') return `<div class="pay-card"><div class="pay-card-label">Cryptocurrency</div>
      ${m.currency ? `<div class="pay-card-row">Currency: <span>${m.currency}${m.network?' ('+m.network+')':''}</span></div>` : ''}
      ${m.address  ? `<div class="pay-card-row">Wallet:<br><span style="font-size:8px;word-break:break-all">${m.address}</span></div>` : ''}
      ${m.note     ? `<div class="pay-card-row" style="color:var(--ink3);font-style:italic;font-size:9px;margin-top:4px">${m.note}</div>` : ''}
    </div>`;
    return '';
  }).join('');
}
