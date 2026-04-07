(function () {
  async function boot() {
    const page = document.body.dataset.page || 'inicio';
    await window.AuCheiCommon.initCommon();

    if (page === 'perdidos') window.AuCheiPets.initPetList('lost');
    if (page === 'encontrados') window.AuCheiPets.initPetList('found');
    if (page === 'recompensas') window.AuCheiPets.initRewards();
    if (page === 'contato') window.AuCheiPets.initContact();
    if (page === 'novo') window.AuCheiPets.initNew();
    if (page === 'perfil') window.AuCheiProfile.initProfile();
    if (page === 'configuracoes') window.AuCheiSettings.initSettings();
    if (page === 'admin') window.AuCheiAdmin.initAdmin();
    if (page === 'login') window.AuCheiAuth.initLogin();
    if (page === 'registro') window.AuCheiAuth.initRegister();

    // logout pode existir em várias páginas que tenham o menu do usuário
    window.AuCheiAuth.initLogout();

    window.AuCheiUtils.refreshIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();