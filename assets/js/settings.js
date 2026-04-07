
(function () {
  const D = window.AuCheiData;
  const { qs, toast, refreshIcons } = window.AuCheiUtils;
  const { applyTheme, renderNavbarState } = window.AuCheiCommon;

  function normalizeProfile(profileForm, profile) {
    const fd = new FormData(profileForm);
    const cityRaw = fd.get('city')?.toString().trim() || '';
    let city = cityRaw;
    let state = profile.state || 'SP';
    if (cityRaw.includes(',')) {
      const [cidade, uf] = cityRaw.split(',').map(v => v.trim());
      city = cidade || cityRaw;
      state = (uf || state).toUpperCase().slice(0, 2);
    }
    return {
      ...profile,
      name: fd.get('name')?.toString().trim() || profile.name,
      email: fd.get('email')?.toString().trim() || profile.email,
      phone: fd.get('phone')?.toString().trim() || profile.phone,
      city,
      state,
      bio: fd.get('bio')?.toString().trim() || profile.bio,
    };
  }

  function initSettings() {
    const profile = D.getProfile();
    const profileForm = qs('#settings-profile-form');
    const prefForm = qs('#settings-preferences-form');
    const themeField = qs('#settings-theme');
    const locationField = qs('#settings-location');

    if (profileForm) {
      profileForm.elements.name.value = profile.name || '';
      profileForm.elements.email.value = profile.email || '';
      profileForm.elements.phone.value = profile.phone || '';
      profileForm.elements.city.value = `${profile.city || ''}${profile.state ? `, ${profile.state}` : ''}`;
      profileForm.elements.bio.value = profile.bio || '';
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        D.saveProfile(normalizeProfile(profileForm, profile));
        renderNavbarState();
        toast('Perfil salvo com sucesso.');
      });
    }

    if (themeField) themeField.value = D.getTheme();
    if (locationField) locationField.value = D.getLocation();

    prefForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (themeField?.value) D.setTheme(themeField.value);
      if (locationField?.value.trim()) D.setLocation(locationField.value.trim());
      applyTheme();
      renderNavbarState();
      refreshIcons();
      toast('Preferências atualizadas.');
    });
  }

  window.AuCheiSettings = { initSettings };
})();
