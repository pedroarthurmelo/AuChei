(function () {
  const D = window.AuCheiData;
  const { qs, refreshIcons } = window.AuCheiUtils;

  function renderProfileStats(pets) {
    qs('#profile-stats').innerHTML = [
      ['Pets perdidos', pets.filter(p => p.type === 'lost').length],
      ['Pets encontrados', pets.filter(p => p.type === 'found').length],
      ['Reunidos', pets.filter(p => p.status === 'found').length],
    ].map(x => `
      <div class="bg-card rounded-xl border border-border p-4 text-center">
        <div class="text-2xl font-bold text-foreground">${x[1]}</div>
        <div class="text-xs text-muted-foreground">${x[0]}</div>
      </div>
    `).join('');
  }

  function renderProfilePosts(pets) {
    const list = qs('#profile-posts');
    const empty = qs('#profile-posts-empty');

    if (pets.length) {
      empty.classList.add('hidden');
      list.innerHTML = pets.slice(0, 5).map(p => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl">
              ${window.AuCheiUtils.petVisual(p, 'w-10 h-10 rounded-lg object-cover')}
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">${window.AuCheiUtils.esc(p.name)}</p>
              <p class="text-xs text-muted-foreground">
                ${window.AuCheiUtils.esc(p.city)}, ${window.AuCheiUtils.esc(p.state)} · ${window.AuCheiUtils.esc(p.date)}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${p.type === 'lost' ? 'bg-primary/10 text-primary' : 'bg-olive/10 text-olive'}">
              ${p.type === 'lost' ? 'Perdido' : 'Encontrado'}
            </span>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}">
              ${p.status === 'active' ? 'Ativo' : p.status === 'found' ? 'Reunido' : 'Fechado'}
            </span>
          </div>
        </div>
      `).join('');
    } else {
      empty.classList.remove('hidden');
      list.innerHTML = '';
    }
  }

  function initProfile() {
    const profile = D.getProfile();
    const pets = D.getPets();

    qs('#profile-avatar').textContent = profile.avatar || '🐾';
    qs('#profile-name').textContent = profile.name || '';
    qs('#profile-bio').textContent = profile.bio || '';
    qs('#profile-email').textContent = profile.email || '';
    qs('#profile-phone').textContent = profile.phone || '';
    qs('#profile-city').textContent = `${profile.city || ''}${profile.state ? `, ${profile.state}` : ''}`;

    renderProfileStats(pets);
    renderProfilePosts(pets);
    refreshIcons();
  }

  window.AuCheiProfile = { initProfile };
})();