
(function () {
  const D = window.AuCheiData;
  const page = document.body.dataset.page || "inicio";

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }
  function esc(s = "") { return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
  function fmtMoney(v) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0); }
  function petVisual(pet, cls = "w-full h-full object-cover") {
    return pet.photo && String(pet.photo).startsWith("data:")
      ? `<img src="${pet.photo}" alt="${esc(pet.name)}" class="${cls}">`
      : `<span class="text-3xl">${esc(pet.photo || "🐾")}</span>`;
  }
  function toast(msg, kind = "ok") {
    const box = qs("#toast-box");
    if (!box) return;
    const el = document.createElement("div");
    el.className = `rounded-xl border px-4 py-3 shadow-lg text-sm bg-card transition-all ${kind === "error" ? "border-destructive text-destructive" : "border-border text-foreground"}`;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(10px)"; }, 2200);
    setTimeout(() => el.remove(), 2600);
  }
  function refreshIcons() { window.lucide && window.lucide.createIcons(); }

  function applyTheme() {
    const dark = D.getTheme() === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    const themeIcon = qs("[data-theme-icon]");
    if (themeIcon) {
      themeIcon.setAttribute("data-lucide", dark ? "sun" : "moon");
      if (themeIcon.tagName.toLowerCase() === "svg") {
        themeIcon.dataset.lucide = dark ? "sun" : "moon";
      }
    }
  }

  function renderNavbarState() {
    const profile = D.getProfile();
    const logged = D.isLoggedIn ? D.isLoggedIn() : true;
    const unread = D.notifications.filter(n => !n.read).length;

    qsa("[data-nav]").forEach(el => el.classList.remove("ativo"));
    qsa(`[data-nav="${page}"]`).forEach(el => el.classList.add("ativo"));

    const badge = qs("#badge-notificacao");
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.classList.remove("hidden");
        badge.classList.add("flex");
      } else {
        badge.classList.add("hidden");
        badge.classList.remove("flex");
      }
    }

    const list = qs("#notif-list");
    if (list) {
      list.innerHTML = D.notifications.map(n => `
        <div class="px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${!n.read ? "bg-coral-light/30" : ""}" data-notif="${n.id}">
          <div class="flex items-start gap-2">
            ${!n.read ? '<div class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>' : ""}
            <div>
              <p class="text-sm font-medium text-foreground">${esc(n.title)}</p>
              <p class="text-xs text-muted-foreground mt-0.5">${esc(n.desc)}</p>
              <p class="text-xs text-muted-foreground/60 mt-1">${esc(n.time)}</p>
            </div>
          </div>
        </div>`).join("");
    }

    const location = D.getLocation();
    const locEl = qs("#user-location");
    if (locEl) locEl.textContent = location;
    const avatar = qs("#user-avatar");
    const name = qs("#user-name");
    const email = qs("#user-email");
    const menuList = qs('.lista-menu');
    const logoutSection = qs('.secao-menu--topo');
    if (avatar) avatar.textContent = logged ? profile.avatar : '👤';
    if (name) name.textContent = logged ? profile.name : 'Visitante';
    if (email) email.textContent = logged ? profile.email : 'Entre ou crie sua conta';
    if (menuList) {
      menuList.innerHTML = logged
        ? `<a href="perfil.html" class="link-menu">Meu perfil</a>
           <a href="perdidos.html" class="link-menu">Meus pets</a>
           <a href="admin.html" class="link-menu">Painel Admin</a>
           <a href="configuracoes.html" class="link-menu">Configurações</a>`
        : `<a href="login.html" class="link-menu">Entrar</a>
           <a href="registro.html" class="link-menu">Criar conta</a>
           <a href="perdidos.html" class="link-menu">Ver pets perdidos</a>
           <a href="encontrados.html" class="link-menu">Ver pets encontrados</a>`;
    }
    if (logoutSection) logoutSection.classList.toggle('hidden', !logged);
  }

  function fecharMenus() {
    qsa("[data-menu]").forEach(menu => menu.classList.add("hidden"));
    qsa("[data-toggle]").forEach(toggle => toggle.setAttribute("aria-expanded", "false"));
  }

  function initCommon() {
    applyTheme();
    fecharMenus();
    renderNavbarState();
    refreshIcons();

    qs("#theme-toggle")?.addEventListener("click", () => {
      D.setTheme(D.getTheme() === "dark" ? "light" : "dark");
      applyTheme();
      refreshIcons();
    });

    qs("#nav-search-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = qs("#nav-search-input")?.value.trim();
      window.location.href = q ? `perdidos.html?q=${encodeURIComponent(q)}` : "perdidos.html";
    });

    qs("#location-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const v = e.target.value.trim();
        if (v) {
          D.setLocation(v);
          renderNavbarState();
          toast("Localização atualizada.");
        }
      }
    });

    qs("#read-all")?.addEventListener("click", () => {
      D.notifications.forEach(n => n.read = true);
      renderNavbarState();
      refreshIcons();
      toast("Notificações marcadas como lidas.");
    });

    qs("#notif-list")?.addEventListener("click", (e) => {
      const item = e.target.closest("[data-notif]");
      if (!item) return;
      const id = Number(item.getAttribute("data-notif"));
      const found = D.notifications.find(n => n.id === id);
      if (found) found.read = true;
      renderNavbarState();
      refreshIcons();
    });

    qsa("[data-toggle]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const key = btn.getAttribute("data-toggle");
        const target = qs(`[data-menu="${key}"]`);
        if (!target) return;
        const estavaFechado = target.classList.contains("hidden");
        fecharMenus();
        qs("#mobile-menu")?.classList.add("hidden");
        if (estavaFechado) {
          target.classList.remove("hidden");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    qsa("[data-menu]").forEach(menu => {
      menu.addEventListener("click", (e) => e.stopPropagation());
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".grupo-menu") && !e.target.closest("#mobile-menu") && !e.target.closest("[data-toggle-mobile]")) {
        fecharMenus();
        qs("#mobile-menu")?.classList.add("hidden");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        fecharMenus();
        qs("#mobile-menu")?.classList.add("hidden");
      }
    });

    qs("[data-toggle-mobile]")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      fecharMenus();
      qs("#mobile-menu")?.classList.toggle("hidden");
    });

    qsa("#mobile-menu a").forEach(link => link.addEventListener("click", () => {
      qs("#mobile-menu")?.classList.add("hidden");
    }));

    document.addEventListener('click', (e) => {
      const logout = e.target.closest('#logout-button');
      if (!logout) return;
      if (D.logout) D.logout();
      toast('Sessão encerrada.');
      fecharMenus();
      qs('#mobile-menu')?.classList.add('hidden');
      setTimeout(() => { window.location.href = 'login.html'; }, 350);
    });
  }

  function petCard(pet) {
    const statusText = pet.status === "active" ? "Ativo" : pet.status === "found" ? "Reunido" : "Fechado";
    const actionText = pet.type === "lost" ? "Entrar em contato" : "Tenho informações";
    return `<div class="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div class="h-56 bg-secondary flex items-center justify-center">${petVisual(pet, "w-full h-full object-cover")}</div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-foreground text-lg">${esc(pet.name)}</h3>
              ${pet.reward ? `<span class="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">${fmtMoney(pet.reward)}</span>` : ""}
            </div>
            <p class="text-sm text-muted-foreground mt-1">${esc(pet.breed)} · ${esc(pet.color)} · ${esc(pet.size)}</p>
          </div>
          <span class="px-2 py-1 rounded-full text-xs font-medium ${pet.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}">${statusText}</span>
        </div>
        <div class="mt-4 space-y-2 text-sm">
          <div class="flex items-center gap-2 text-muted-foreground"><i data-lucide="map-pin" class="w-4 h-4"></i> ${esc(pet.city)}, ${esc(pet.state)}</div>
          ${pet.description ? `<p class="text-sm text-muted-foreground mt-2 line-clamp-2">${esc(pet.description)}</p>` : ""}
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
    const searchInput = qs("#pet-search");
    const query = (params.get("q") || "").trim().toLowerCase();
    if (searchInput) searchInput.value = query;

    const render = () => {
      const q = (searchInput?.value || "").trim().toLowerCase();
      const pets = D.getPets()
        .filter(p => p.type === type)
        .filter(p => !q || [p.name, p.breed, p.color, p.city, p.neighborhood, p.description].join(" ").toLowerCase().includes(q));

      qs("#pet-list").innerHTML = pets.map(petCard).join("");
      qs("#pet-empty").classList.toggle("hidden", pets.length > 0);
      refreshIcons();
    };

    render();

    searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        window.location.href = `${type === "lost" ? "perdidos.html" : "encontrados.html"}?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }

  function initRewards() {
    const pets = D.getPets().filter(p => p.reward && p.reward > 0 && p.status === "active").sort((a, b) => (b.reward || 0) - (a.reward || 0));
    const total = pets.reduce((a, p) => a + (p.reward || 0), 0);
    const stats = [
      [`R$ ${total.toLocaleString("pt-BR")}`, "Em recompensas ativas", "💰"],
      [String(pets.length), "Casos com recompensa", "🎁"],
      ["23", "Recompensas pagas", "✅"],
      ["R$ 12.800", "Total já pago", "💵"],
    ];
    qs("#reward-stats").innerHTML = stats.map(s => `<div class="bg-card rounded-2xl border border-border p-5 flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">${s[2]}</div><div><div class="text-xl font-bold text-foreground">${s[0]}</div><div class="text-xs text-muted-foreground">${s[1]}</div></div></div>`).join("");

    const list = qs("#reward-list");
    const empty = qs("#reward-empty");
    if (!pets.length) {
      empty.classList.remove("hidden");
      list.innerHTML = "";
      return;
    }
    empty.classList.add("hidden");
    list.innerHTML = pets.slice(0, 5).map((pet, i) => `
      <div class="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">${i + 1}º</div>
        <div class="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl shrink-0">${petVisual(pet, "w-12 h-12 rounded-lg object-cover")}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-foreground">${esc(pet.name)}</h3>
          <p class="text-sm text-muted-foreground flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${esc(pet.city)}, ${esc(pet.state)} <span class="mx-1">·</span> ${esc(pet.breed)}</p>
        </div>
        <div class="text-right shrink-0">
          <div class="text-lg font-bold text-primary">${fmtMoney(pet.reward)}</div>
          <a href="contato.html" class="text-xs text-primary hover:underline">Tenho informações</a>
        </div>
      </div>`).join("");
    refreshIcons();
  }

  function initContact() {
    qs("#contact-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      toast("Mensagem enviada com sucesso!");
      e.target.reset();
    });
  }

  function initNew() {
    const params = new URLSearchParams(window.location.search);
    const initialType = params.get("type") === "found" ? "found" : "lost";
    const typeInput = qs("#post-type");
    const rewardWrap = qs("#reward-wrap");
    const btnLost = qs("#btn-lost");
    const btnFound = qs("#btn-found");

    function setType(type) {
      typeInput.value = type;
      rewardWrap.classList.toggle("hidden", type !== "lost");
      btnLost.className = `px-4 py-2 rounded-full text-sm font-medium ${type === "lost" ? "bg-primary text-primary-foreground" : "text-foreground"}`;
      btnFound.className = `px-4 py-2 rounded-full text-sm font-medium ${type === "found" ? "bg-olive text-olive-foreground" : "text-foreground"}`;
    }

    setType(initialType);
    btnLost?.addEventListener("click", () => setType("lost"));
    btnFound?.addEventListener("click", () => setType("found"));

    qs("#new-post-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      if (!fd.get("name") || !fd.get("city") || !fd.get("state") || !fd.get("contactName") || !fd.get("contactPhone")) {
        toast("Preencha todos os campos obrigatórios.", "error");
        return;
      }
      D.addPet({
        type: fd.get("type"),
        name: fd.get("name"),
        species: fd.get("species"),
        breed: fd.get("breed") || "",
        color: fd.get("color") || "",
        size: fd.get("size"),
        gender: fd.get("gender"),
        city: fd.get("city"),
        state: fd.get("state"),
        neighborhood: fd.get("neighborhood") || "",
        description: fd.get("description") || "",
        reward: Number(fd.get("reward") || 0),
        photo: fd.get("photo") || (fd.get("species") === "cat" ? "🐈" : "🐕"),
        date: new Date().toISOString().slice(0, 10),
        contactName: fd.get("contactName"),
        contactPhone: fd.get("contactPhone"),
        contactEmail: fd.get("contactEmail") || "",
      });
      toast("Publicação criada com sucesso!");
      setTimeout(() => { window.location.href = fd.get("type") === "lost" ? "perdidos.html" : "encontrados.html"; }, 700);
    });
  }

  function initProfile() {
    const profile = D.getProfile();
    const pets = D.getPets();

    qs("#profile-avatar").textContent = profile.avatar;
    qs("#profile-name").textContent = profile.name;
    qs("#profile-bio").textContent = profile.bio;
    qs("#profile-email").textContent = profile.email;
    qs("#profile-phone").textContent = profile.phone;
    qs("#profile-city").textContent = `${profile.city}, ${profile.state || "SP"}`;

    const form = qs("#profile-form");
    form.elements.name.value = profile.name;
    form.elements.email.value = profile.email;
    form.elements.phone.value = profile.phone;
    form.elements.city.value = profile.city;
    form.elements.bio.value = profile.bio;

    qs("#profile-stats").innerHTML = [
      ["Pets perdidos", pets.filter(p => p.type === "lost").length],
      ["Pets encontrados", pets.filter(p => p.type === "found").length],
      ["Reunidos", pets.filter(p => p.status === "found").length],
    ].map(x => `<div class="bg-card rounded-xl border border-border p-4 text-center"><div class="text-2xl font-bold text-foreground">${x[1]}</div><div class="text-xs text-muted-foreground">${x[0]}</div></div>`).join("");

    const list = qs("#profile-posts");
    const empty = qs("#profile-posts-empty");
    if (pets.length) {
      empty.classList.add("hidden");
      list.innerHTML = pets.slice(0, 5).map(p => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl">${petVisual(p, "w-10 h-10 rounded-lg object-cover")}</div>
            <div><p class="text-sm font-medium text-foreground">${esc(p.name)}</p><p class="text-xs text-muted-foreground">${esc(p.city)}, ${esc(p.state)} · ${esc(p.date)}</p></div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${p.type === "lost" ? "bg-primary/10 text-primary" : "bg-olive/10 text-olive"}">${p.type === "lost" ? "Perdido" : "Encontrado"}</span>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${p.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}">${p.status === "active" ? "Ativo" : p.status === "found" ? "Reunido" : "Fechado"}</span>
          </div>
        </div>`).join("");
    } else {
      empty.classList.remove("hidden");
      list.innerHTML = "";
    }

    qs("#edit-profile-toggle")?.addEventListener("click", () => qs("#profile-edit").classList.toggle("hidden"));
    qs("#cancel-profile-edit")?.addEventListener("click", () => qs("#profile-edit").classList.add("hidden"));

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      D.saveProfile({
        ...profile,
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        city: fd.get("city"),
        bio: fd.get("bio"),
      });
      toast("Perfil atualizado!");
      setTimeout(() => window.location.reload(), 600);
    });
    refreshIcons();
  }

  function initSettings() {
    const profile = D.getProfile();
    const profileForm = qs("#settings-profile-form");
    const prefForm = qs("#settings-preferences-form");
    const themeField = qs("#settings-theme");
    const locationField = qs("#settings-location");

    if (profileForm) {
      profileForm.elements.name.value = profile.name || "";
      profileForm.elements.email.value = profile.email || "";
      profileForm.elements.phone.value = profile.phone || "";
      profileForm.elements.city.value = profile.city || "";
      profileForm.elements.bio.value = profile.bio || "";
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(profileForm);
        D.saveProfile({
          ...profile,
          name: fd.get("name")?.toString().trim() || profile.name,
          email: fd.get("email")?.toString().trim() || profile.email,
          phone: fd.get("phone")?.toString().trim() || profile.phone,
          city: fd.get("city")?.toString().trim() || profile.city,
          bio: fd.get("bio")?.toString().trim() || profile.bio,
        });
        renderNavbarState();
        toast("Perfil salvo com sucesso.");
      });
    }

    if (themeField) themeField.value = D.getTheme();
    if (locationField) locationField.value = D.getLocation();

    prefForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (themeField?.value) D.setTheme(themeField.value);
      if (locationField?.value.trim()) D.setLocation(locationField.value.trim());
      applyTheme();
      renderNavbarState();
      refreshIcons();
      toast("Preferências atualizadas.");
    });
  }


  function initLogin() {
    const form = qs('#login-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const email = fd.get('email')?.toString().trim() || '';
      const password = fd.get('password')?.toString() || '';
      if (!email || !password) {
        toast('Preencha e-mail e senha.', 'error');
        return;
      }
      const result = D.login ? D.login(email, password) : { ok:true };
      if (!result.ok) {
        toast(result.message || 'Não foi possível entrar.', 'error');
        return;
      }
      toast('Login realizado com sucesso!');
      setTimeout(() => { window.location.href = 'perfil.html'; }, 500);
    });
  }

  function initRegister() {
    const form = qs('#register-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = {
        name: fd.get('name')?.toString().trim() || '',
        email: fd.get('email')?.toString().trim() || '',
        password: fd.get('password')?.toString() || '',
        phone: fd.get('phone')?.toString().trim() || '',
        city: fd.get('city')?.toString().trim() || '',
        bio: fd.get('bio')?.toString().trim() || '',
      };
      const confirm = fd.get('confirmPassword')?.toString() || '';
      if (!data.name || !data.email || !data.password || !confirm) {
        toast('Preencha os campos obrigatórios.', 'error');
        return;
      }
      if (data.password.length < 6) {
        toast('A senha precisa ter pelo menos 6 caracteres.', 'error');
        return;
      }
      if (data.password !== confirm) {
        toast('As senhas não coincidem.', 'error');
        return;
      }
      const result = D.registerUser ? D.registerUser(data) : { ok:true };
      if (!result.ok) {
        toast(result.message || 'Não foi possível criar a conta.', 'error');
        return;
      }
      toast('Conta criada com sucesso!');
      setTimeout(() => { window.location.href = 'perfil.html'; }, 600);
    });
  }

  function initAdmin() {
    function render() {
      const pets = D.getPets();
      const active = pets.filter(p => p.status === "active").length;
      qs("#admin-stats").innerHTML = [
        ["Total", pets.length, "bg-primary/10 text-primary"],
        ["Perdidos", pets.filter(p => p.type === "lost").length, "bg-destructive/10 text-destructive"],
        ["Encontrados", pets.filter(p => p.type === "found").length, "bg-olive/10 text-olive"],
        ["Ativos", active, "bg-success/10 text-success"],
        ["Reunidos", pets.filter(p => p.status === "found").length, "bg-primary/10 text-primary"],
      ].map(s => `<div class="bg-card rounded-2xl border border-border p-5"><span class="inline-flex px-2 py-1 rounded-full text-xs font-medium ${s[2]}">${s[0]}</span><div class="text-3xl font-bold text-foreground mt-3">${s[1]}</div></div>`).join("");

      qs("#admin-posts").innerHTML = pets.map(p => `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-secondary/50">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-background flex items-center justify-center text-2xl">${petVisual(p, "w-14 h-14 rounded-xl object-cover")}</div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-semibold text-foreground">${esc(p.name)}</h3>
                <span class="px-2 py-1 rounded-full text-xs ${p.type === "lost" ? "bg-primary/10 text-primary" : "bg-olive/10 text-olive"}">${p.type === "lost" ? "Perdido" : "Encontrado"}</span>
                <span class="px-2 py-1 rounded-full text-xs ${p.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}">${p.status === "active" ? "Ativo" : p.status === "found" ? "Reunido" : "Fechado"}</span>
              </div>
              <p class="text-sm text-muted-foreground">${esc(p.city)}, ${esc(p.state)} · ${esc(p.breed)}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button data-found="${p.id}" class="px-3 py-2 rounded-lg bg-success text-success-foreground text-sm">Marcar reunido</button>
            <button data-close="${p.id}" class="px-3 py-2 rounded-lg bg-secondary text-foreground text-sm">Fechar</button>
            <button data-delete="${p.id}" class="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm">Excluir</button>
          </div>
        </div>`).join("");

      qsa("[data-found]").forEach(b => b.addEventListener("click", () => { D.updatePet(b.dataset.found, { status: "found" }); render(); toast("Status atualizado!"); }));
      qsa("[data-close]").forEach(b => b.addEventListener("click", () => { D.updatePet(b.dataset.close, { status: "closed" }); render(); toast("Publicação fechada."); }));
      qsa("[data-delete]").forEach(b => b.addEventListener("click", () => { D.deletePet(b.dataset.delete); render(); toast("Publicação removida."); }));
      refreshIcons();
    }
    render();
  }

  initCommon();
  if (page === "perdidos") initPetList("lost");
  if (page === "encontrados") initPetList("found");
  if (page === "recompensas") initRewards();
  if (page === "contato") initContact();
  if (page === "novo") initNew();
  if (page === "perfil") initProfile();
  if (page === "configuracoes") initSettings();
  if (page === "admin") initAdmin();
  if (page === "login") initLogin();
  if (page === "registro") initRegister();
  refreshIcons();
})();
