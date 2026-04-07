
(function () {
  const D = window.AuCheiData;
  const { qs, qsa, esc, refreshIcons, toast } = window.AuCheiUtils;
  const { syncSessionFromBackend, logout } = window.AuCheiApi;

  function applyTheme() {
    const dark = D.getTheme() === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    const themeIcon = qs('[data-theme-icon]');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', dark ? 'sun' : 'moon');
      if (themeIcon.tagName.toLowerCase() === 'svg') {
        themeIcon.dataset.lucide = dark ? 'sun' : 'moon';
      }
    }
  }

  function renderNavbarState() {
    const page = document.body.dataset.page || 'inicio';
    const profile = D.getProfile();
    const logged = D.isLoggedIn ? D.isLoggedIn() : !!localStorage.getItem('auchei_sessao');
    const unread = D.notifications.filter(n => !n.read).length;

    qsa('[data-nav]').forEach(el => el.classList.remove('ativo'));
    qsa(`[data-nav="${page}"]`).forEach(el => el.classList.add('ativo'));

    const badge = qs('#badge-notificacao');
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.classList.remove('hidden');
        badge.classList.add('flex');
      } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
      }
    }

    const list = qs('#notif-list');
    if (list) {
      list.innerHTML = D.notifications.map(n => `
        <div class="px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${!n.read ? 'bg-coral-light/30' : ''}" data-notif="${n.id}">
          <div class="flex items-start gap-2">
            ${!n.read ? '<div class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>' : ''}
            <div>
              <p class="text-sm font-medium text-foreground">${esc(n.title)}</p>
              <p class="text-xs text-muted-foreground mt-0.5">${esc(n.desc)}</p>
              <p class="text-xs text-muted-foreground/60 mt-1">${esc(n.time)}</p>
            </div>
          </div>
        </div>`).join('');
    }

    const location = D.getLocation();
    const locEl = qs('#user-location');
    if (locEl) locEl.textContent = location;

    const avatar = qs('#user-avatar');
    const name = qs('#user-name');
    const email = qs('#user-email');
    const menuList = qs('.lista-menu');
    const logoutSection = qs('.secao-menu--topo');

    if (avatar) avatar.textContent = logged ? profile.avatar : '👤';
    if (name) name.textContent = logged ? profile.name : 'Visitante';
    if (email) email.textContent = logged ? profile.email : 'Entre ou crie sua conta';

    if (menuList) {
      menuList.innerHTML = logged
        ? `<a href="perfil.html" class="link-menu">Meu perfil</a>
           <a href="perdidos.html" class="link-menu">Meus pets</a>
           <a href="admin.html" class="link-menu">Painel Admin</a>`
        : `<a href="login.html" class="link-menu">Entrar</a>
           <a href="registro.html" class="link-menu">Criar conta</a>
           <a href="perdidos.html" class="link-menu">Ver pets perdidos</a>
           <a href="encontrados.html" class="link-menu">Ver pets encontrados</a>`;
    }

    if (logoutSection) logoutSection.classList.toggle('hidden', !logged);
  }

  function fecharMenus() {
    qsa('[data-menu]').forEach(menu => menu.classList.add('hidden'));
    qsa('[data-toggle]').forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
  }

  async function initCommon() {
    applyTheme();
    fecharMenus();
    await syncSessionFromBackend();
    renderNavbarState();
    refreshIcons();

    qs('#theme-toggle')?.addEventListener('click', () => {
      D.setTheme(D.getTheme() === 'dark' ? 'light' : 'dark');
      applyTheme();
      refreshIcons();
    });

    qs('#nav-search-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = qs('#nav-search-input')?.value.trim();
      window.location.href = q ? `perdidos.html?q=${encodeURIComponent(q)}` : 'perdidos.html';
    });

    qs('#location-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const v = e.target.value.trim();
        if (v) {
          D.setLocation(v);
          renderNavbarState();
          toast('Localização atualizada.');
        }
      }
    });

    qs('#read-all')?.addEventListener('click', () => {
      D.notifications.forEach(n => n.read = true);
      renderNavbarState();
      refreshIcons();
      toast('Notificações marcadas como lidas.');
    });

    qs('#notif-list')?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-notif]');
      if (!item) return;
      const id = Number(item.getAttribute('data-notif'));
      const found = D.notifications.find(n => n.id === id);
      if (found) found.read = true;
      renderNavbarState();
      refreshIcons();
    });

    qsa('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const key = btn.getAttribute('data-toggle');
        const target = qs(`[data-menu="${key}"]`);
        if (!target) return;
        const estavaFechado = target.classList.contains('hidden');
        fecharMenus();
        qs('#mobile-menu')?.classList.add('hidden');
        if (estavaFechado) {
          target.classList.remove('hidden');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    qsa('[data-menu]').forEach(menu => menu.addEventListener('click', (e) => e.stopPropagation()));

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.grupo-menu') && !e.target.closest('#mobile-menu') && !e.target.closest('[data-toggle-mobile]')) {
        fecharMenus();
        qs('#mobile-menu')?.classList.add('hidden');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        fecharMenus();
        qs('#mobile-menu')?.classList.add('hidden');
      }
    });

    qs('[data-toggle-mobile]')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fecharMenus();
      qs('#mobile-menu')?.classList.toggle('hidden');
    });

    qsa('#mobile-menu a').forEach(link => link.addEventListener('click', () => qs('#mobile-menu')?.classList.add('hidden')));

    document.addEventListener('click', async (e) => {
      const logoutButton = e.target.closest('#logout-button');
      if (!logoutButton) return;
      e.preventDefault();
      await logout();
      renderNavbarState();
      toast('Logout realizado com sucesso.');
      setTimeout(() => { window.location.href = 'login.html'; }, 350);
    });
  }

  window.AuCheiCommon = { applyTheme, renderNavbarState, fecharMenus, initCommon };
})();
