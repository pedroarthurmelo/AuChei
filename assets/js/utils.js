
(function () {
  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }
  function esc(s = "") {
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function fmtMoney(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);
  }
  function petVisual(pet, cls = 'w-full h-full object-cover') {
    return pet.photo && String(pet.photo).startsWith('data:')
      ? `<img src="${pet.photo}" alt="${esc(pet.name)}" class="${cls}">`
      : `<span class="text-3xl">${esc(pet.photo || '🐾')}</span>`;
  }
  function toast(msg, kind = 'ok') {
    const box = qs('#toast-box');
    if (!box) return;
    const el = document.createElement('div');
    el.className = `rounded-xl border px-4 py-3 shadow-lg text-sm bg-card transition-all ${kind === 'error' ? 'border-destructive text-destructive' : 'border-border text-foreground'}`;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(10px)'; }, 2200);
    setTimeout(() => el.remove(), 2600);
  }
  function refreshIcons() { window.lucide && window.lucide.createIcons(); }

  window.AuCheiUtils = { qs, qsa, esc, fmtMoney, petVisual, toast, refreshIcons };
})();
