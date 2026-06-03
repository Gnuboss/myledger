/* ════════════════════════════════════════════════════════
   APP — boot sequence (loaded last)
   ════════════════════════════════════════════════════════ */

(function boot() {
  /* Load persisted data */
  try { DB       = JSON.parse(localStorage.getItem(STORE_KEY)    || '[]'); } catch(e) { DB = []; }
  try { SETTINGS = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch(e) { SETTINGS = {}; }

  /* Sanitise — remove any corrupt records */
  DB = DB.filter(d => d && d.id && typeof d.id === 'string');

  /* Load first doc or start fresh */
  if (DB.length) {
    loadDoc(DB[0].id);
  } else {
    startBlank('quote');
  }

  renderList();
  initDocAreaTap();
  initBannerAndWelcome();
})();

/* ── KEYBOARD SHORTCUTS ────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { dismissWelcome(); closeMobPanel(); }
  if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveDoc(); }
  if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); printDoc(); }
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); showNewMenu(); }
});
