
(function () {
  const D = window.AuCheiData;
  const { qs, qsa, esc, fmtMoney, petVisual, toast, refreshIcons } = window.AuCheiUtils;

  function petCard(pet) {
    const statusText = pet.type === 'lost' ? 'Perdido' : 'Encontrado';
    const actionText = pet.type === 'lost' ? 'Entrar em contato' : 'Tenho informações';
    return `<div class="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div class="h-56 bg-secondary flex items-center justify-center">${petVisual(pet, 'w-full h-full object-cover')}</div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-foreground text-lg">${esc(pet.name)}</h3>
              ${pet.reward ? `<span class="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">${fmtMoney(pet.reward)}</span>` : ''}
            </div>
            <p class="text-sm text-muted-foreground mt-1">${esc(pet.breed)} · ${esc(pet.color)} · ${esc(pet.size)}</p>
          </div>
          <span class="px-2 py-1 rounded-full text-xs font-medium ${pet.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}">${statusText}</span>
        </div>
        <div class="mt-4 space-y-2 text-sm">
          <div class="flex items-center gap-2 text-muted-foreground"><i data-lucide="map-pin" class="w-4 h-4"></i> ${esc(pet.city)}, ${esc(pet.state)}</div>
          ${pet.description ? `<p class="text-sm text-muted-foreground mt-2 line-clamp-2">${esc(pet.description)}</p>` : ''}
        </div>
        <div class="flex items-center justify-between mt-4">
          <span class="text-xs text-muted-foreground">${esc(pet.date)}</span>
          <a href="contato.html" class="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">${actionText}</a>
        </div>
      </div>
    </div>`;
  }

  function initPetList(type) {
    const params = new URLSearchParams(window.location.search);
    const searchInput = qs('#pet-search');
    const query = (params.get('q') || '').trim().toLowerCase();
    if (searchInput) searchInput.value = query;

    const render = () => {
      const q = (searchInput?.value || '').trim().toLowerCase();
      const pets = D.getPets()
        .filter(p => p.type === type)
        .filter(p => !q || [p.name, p.breed, p.color, p.city, p.neighborhood, p.description].join(' ').toLowerCase().includes(q));

      qs('#pet-list').innerHTML = pets.map(petCard).join('');
      qs('#pet-empty')?.classList.toggle('hidden', pets.length > 0);
      refreshIcons();
    };

    render();
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.location.href = `${type === 'lost' ? 'perdidos.html' : 'encontrados.html'}?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }

  function initRewards() {
    const pets = D.getPets().filter(p => p.reward && p.reward > 0 && p.status === 'active').sort((a, b) => (b.reward || 0) - (a.reward || 0));
    const total = pets.reduce((a, p) => a + (p.reward || 0), 0);
    const stats = [
      [`R$ ${total.toLocaleString('pt-BR')}`, 'Em recompensas ativas', '💰'],
      [String(pets.length), 'Casos com recompensa', '🎁'],
      ['23', 'Recompensas pagas', '✅'],
      ['R$ 12.800', 'Total já pago', '💵'],
    ];
    qs('#reward-stats').innerHTML = stats.map(s => `<div class="bg-card rounded-2xl border border-border p-5 flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">${s[2]}</div><div><div class="text-xl font-bold text-foreground">${s[0]}</div><div class="text-xs text-muted-foreground">${s[1]}</div></div></div>`).join('');

    const list = qs('#reward-list');
    const empty = qs('#reward-empty');
    if (!pets.length) {
      empty?.classList.remove('hidden');
      if (list) list.innerHTML = '';
      return;
    }
    empty?.classList.add('hidden');
    list.innerHTML = pets.slice(0, 5).map((pet, i) => `
      <div class="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">${i + 1}º</div>
        <div class="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl shrink-0">${petVisual(pet, 'w-12 h-12 rounded-lg object-cover')}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-foreground">${esc(pet.name)}</h3>
          <p class="text-sm text-muted-foreground flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${esc(pet.city)}, ${esc(pet.state)} <span class="mx-1">·</span> ${esc(pet.breed)}</p>
        </div>
        <div class="text-right shrink-0">
          <div class="text-lg font-bold text-primary">${fmtMoney(pet.reward)}</div>
          <a href="contato.html" class="text-xs text-primary hover:underline">Tenho informações</a>
        </div>
      </div>`).join('');
    refreshIcons();
  }

  function initContact() {
    qs('#contact-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      toast('Mensagem enviada com sucesso!');
      e.target.reset();
    });
  }

  function initNew() {
    const params = new URLSearchParams(window.location.search);
    const initialType = params.get('type') === 'found' ? 'found' : 'lost';
    const typeInput = qs('#post-type');
    const rewardWrap = qs('#reward-wrap');
    const btnLost = qs('#btn-lost');
    const btnFound = qs('#btn-found');

    function setType(type) {
      typeInput.value = type;
      rewardWrap?.classList.toggle('hidden', type !== 'lost');
      if (btnLost) btnLost.className = `px-4 py-2 rounded-full text-sm font-medium ${type === 'lost' ? 'bg-primary text-primary-foreground' : 'text-foreground'}`;
      if (btnFound) btnFound.className = `px-4 py-2 rounded-full text-sm font-medium ${type === 'found' ? 'bg-olive text-olive-foreground' : 'text-foreground'}`;
    }

    setType(initialType);
    btnLost?.addEventListener('click', () => setType('lost'));
    btnFound?.addEventListener('click', () => setType('found'));

    qs('#new-post-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      if (!fd.get('name') || !fd.get('city') || !fd.get('state') || !fd.get('contactName') || !fd.get('contactPhone')) {
        toast('Preencha todos os campos obrigatórios.', 'error');
        return;
      }
      D.addPet({
        type: fd.get('type'),
        name: fd.get('name'),
        species: fd.get('species'),
        breed: fd.get('breed') || '',
        color: fd.get('color') || '',
        size: fd.get('size'),
        gender: fd.get('gender'),
        city: fd.get('city'),
        state: fd.get('state'),
        neighborhood: fd.get('neighborhood') || '',
        description: fd.get('description') || '',
        reward: Number(fd.get('reward') || 0),
        photo: fd.get('photo') || (fd.get('species') === 'cat' ? '🐈' : '🐕'),
        date: new Date().toISOString().slice(0, 10),
        contactName: fd.get('contactName'),
        contactPhone: fd.get('contactPhone'),
        contactEmail: fd.get('contactEmail') || '',
      });
      toast('Publicação criada com sucesso!');
      setTimeout(() => { window.location.href = fd.get('type') === 'lost' ? 'perdidos.html' : 'encontrados.html'; }, 700);
    });
  }

  window.AuCheiPets = { initPetList, initRewards, initContact, initNew };
})();
