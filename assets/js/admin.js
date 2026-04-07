
(function () {
  const D = window.AuCheiData;
  const { qs, qsa, esc, petVisual, toast, refreshIcons } = window.AuCheiUtils;

  function initAdmin() {
    function render() {
      const pets = D.getPets();
      const active = pets.filter(p => p.status === 'active').length;
      qs('#admin-stats').innerHTML = [
        ['Total', pets.length, 'bg-primary/10 text-primary'],
        ['Perdidos', pets.filter(p => p.type === 'lost').length, 'bg-destructive/10 text-destructive'],
        ['Encontrados', pets.filter(p => p.type === 'found').length, 'bg-olive/10 text-olive'],
        ['Ativos', active, 'bg-success/10 text-success'],
        ['Reunidos', pets.filter(p => p.status === 'found').length, 'bg-primary/10 text-primary'],
      ].map(s => `<div class="bg-card rounded-2xl border border-border p-5"><span class="inline-flex px-2 py-1 rounded-full text-xs font-medium ${s[2]}">${s[0]}</span><div class="text-3xl font-bold text-foreground mt-3">${s[1]}</div></div>`).join('');

      qs('#admin-posts').innerHTML = pets.map(p => `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-secondary/50">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-background flex items-center justify-center text-2xl">${petVisual(p, 'w-14 h-14 rounded-xl object-cover')}</div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-semibold text-foreground">${esc(p.name)}</h3>
                <span class="px-2 py-1 rounded-full text-xs ${p.type === 'lost' ? 'bg-primary/10 text-primary' : 'bg-olive/10 text-olive'}">${p.type === 'lost' ? 'Perdido' : 'Encontrado'}</span>
                <span class="px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}">${p.status === 'active' ? 'Ativo' : p.status === 'found' ? 'Reunido' : 'Fechado'}</span>
              </div>
              <p class="text-sm text-muted-foreground">${esc(p.city)}, ${esc(p.state)} · ${esc(p.breed)}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button data-found="${p.id}" class="px-3 py-2 rounded-lg bg-success text-success-foreground text-sm">Marcar reunido</button>
            <button data-close="${p.id}" class="px-3 py-2 rounded-lg bg-secondary text-foreground text-sm">Fechar</button>
            <button data-delete="${p.id}" class="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm">Excluir</button>
          </div>
        </div>`).join('');

      qsa('[data-found]').forEach(b => b.addEventListener('click', () => { D.updatePet(b.dataset.found, { status: 'found' }); render(); toast('Status atualizado!'); }));
      qsa('[data-close]').forEach(b => b.addEventListener('click', () => { D.updatePet(b.dataset.close, { status: 'closed' }); render(); toast('Publicação fechada.'); }));
      qsa('[data-delete]').forEach(b => b.addEventListener('click', () => { D.deletePet(b.dataset.delete); render(); toast('Publicação removida.'); }));
      refreshIcons();
    }
    render();
  }

  window.AuCheiAdmin = { initAdmin };
})();
