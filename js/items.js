/* ════════════════════════════════════════════════════════
   ITEMS — line item CRUD and calculations
   ════════════════════════════════════════════════════════ */

function addRow(data) {
  data = data || {};
  const body      = document.getElementById('items-body');
  const rowId     = 'row-' + (++ROW_COUNTER);
  const num       = body.querySelectorAll('tr').length + 1;
  const lineTotal = ((data.qty || 1) * (data.rate || 0) * (1 - (data.disc || 0) / 100)).toFixed(2);

  const tr = document.createElement('tr');
  tr.id = rowId;
  tr.innerHTML = `
    <td class="f-mono f-sm f-muted row-num">${String(num).padStart(2,'0')}</td>
    <td><span class="cell-txt" contenteditable="true">${data.title  || ''}</span></td>
    <td data-c="det"><span class="cell-detail" contenteditable="true">${data.detail || ''}</span></td>
    <td class="r"><input class="cell-in cq" type="number" value="${data.qty  != null ? data.qty  : 1}"   min="0" style="width:42px"></td>
    <td class="r"><input class="cell-in cr" type="number" value="${data.rate != null ? data.rate : ''}"  min="0" placeholder="0.00" style="width:68px"></td>
    <td class="r" data-c="disc"><input class="cell-in cds" type="number" value="${data.disc != null ? data.disc : ''}" min="0" max="100" placeholder="0" style="width:44px"></td>
    <td class="r f-mono f-sm f-bold line-total">${lineTotal}</td>
    <td><button class="del-row" onclick="delRow('${rowId}')" title="Remove">×</button></td>`;

  tr.querySelectorAll('.cq,.cr,.cds').forEach(inp => inp.addEventListener('input', recalc));
  body.appendChild(tr);
}

function delRow(rowId) {
  const tr = document.getElementById(rowId);
  if (tr) tr.remove();
  document.querySelectorAll('#items-body tr').forEach((r, i) => {
    const n = r.querySelector('.row-num');
    if (n) n.textContent = String(i + 1).padStart(2, '0');
  });
  recalc();
}

function getItems() {
  return Array.from(document.querySelectorAll('#items-body tr')).map(r => ({
    title:  r.querySelector('.cell-txt')?.textContent  || '',
    detail: r.querySelector('.cell-detail')?.textContent || '',
    qty:    parseFloat(r.querySelector('.cq')?.value  || 1),
    rate:   parseFloat(r.querySelector('.cr')?.value  || 0),
    disc:   parseFloat(r.querySelector('.cds')?.value || 0),
  }));
}

function renderItems(items) {
  document.getElementById('items-body').innerHTML = '';
  ROW_COUNTER = 0;
  (items && items.length ? items : [{}]).forEach(it => addRow(it));
  recalc();
}

function recalc() {
  let sub = 0;
  document.querySelectorAll('#items-body tr').forEach(r => {
    const qty  = parseFloat(r.querySelector('.cq')?.value  || 1);
    const rate = parseFloat(r.querySelector('.cr')?.value  || 0);
    const disc = parseFloat(r.querySelector('.cds')?.value || 0);
    const lt   = qty * rate * (1 - disc / 100);
    sub += lt;
    const cell = r.querySelector('.line-total');
    if (cell) cell.textContent = lt.toFixed(2);
  });

  const discAmt  = parseFloat(document.getElementById('p-disc')?.value || 0);
  const discType = document.getElementById('p-disc-type')?.value || 'fixed';
  const taxRate  = parseFloat(document.getElementById('p-tax')?.value  || 0);
  const disc     = discType === 'pct' ? sub * (discAmt / 100) : discAmt;
  const taxable  = sub - disc;
  const tax      = taxable * (taxRate / 100);
  const total    = taxable + tax;

  document.getElementById('t-sub').textContent   = fmt(sub);
  document.getElementById('t-disc').textContent  = '-' + fmt(disc);
  document.getElementById('t-tax').textContent   = fmt(tax);
  document.getElementById('t-total').textContent = fmt(total);
  document.getElementById('disc-row').style.display = disc > 0 ? 'flex' : 'none';
  document.getElementById('tax-row').style.display  = tax  > 0 ? 'flex' : 'none';

  return { sub, disc, tax, total };
}
