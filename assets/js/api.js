(function () {
  const { toast } = window.AuCheiUtils;

  const API_BASE = 'assets/php/auth';

  function buildApiUrl(fileName) {
    return `${API_BASE}/${fileName}`;
  }

  async function requestJson(url, options = {}) {
    const resposta = await fetch(url, {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    const contentType = resposta.headers.get('content-type') || '';
    let json = null;

    if (contentType.includes('application/json')) {
      try {
        json = await resposta.json();
      } catch (error) {
        json = null;
      }
    } else {
      const texto = await resposta.text();
      console.error('Resposta não JSON:', texto);
      throw new Error(
        resposta.ok
          ? 'Resposta inválida do servidor.'
          : `Erro HTTP ${resposta.status}. Verifique o caminho do endpoint.`
      );
    }

    if (!resposta.ok || !json?.sucesso) {
      throw new Error(json?.mensagem || 'Não foi possível concluir a operação.');
    }

    return json;
  }

  function salvarSessaoFrontend(usuario) {
    if (!usuario) return;

    try {
      localStorage.setItem('auchei_sessao', JSON.stringify({ email: usuario.email }));

      localStorage.setItem(
        'auchei_profile',
        JSON.stringify({
          name: usuario.nome || usuario.name || '',
          email: usuario.email || '',
          phone: usuario.telefone || usuario.phone || '',
          city: usuario.cidade || usuario.city || '',
          state: usuario.estado || usuario.state || '',
          avatar: usuario.avatar || '🐾',
          bio: usuario.bio || '',
          joinedAt: usuario.criado_em || new Date().toISOString().slice(0, 10)
        })
      );
    } catch (error) {
      console.error('Erro ao salvar sessão no navegador:', error);
    }
  }

  function limparSessaoFrontend() {
    try {
      if (window.AuCheiData?.logout) window.AuCheiData.logout();
      localStorage.removeItem('usuario');
      localStorage.removeItem('auchei_profile');
      localStorage.removeItem('auchei_sessao');
      sessionStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar sessão local:', error);
    }
  }

  async function login(payload) {
    const resposta = await requestJson(buildApiUrl('login.php'), {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    salvarSessaoFrontend(resposta.usuario);
    return resposta;
  }

  async function register(payload) {
    const resposta = await requestJson(buildApiUrl('cadastro.php'), {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return resposta;
  }

  async function updateProfile(payload) {
    const resposta = await requestJson(buildApiUrl('atualizar_perfil.php'), {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (resposta?.usuario) {
      salvarSessaoFrontend(resposta.usuario);
    }

    return resposta;
  }

  async function getLoggedUser() {
    return requestJson(buildApiUrl('usuario_logado.php'));
  }

  async function syncSessionFromBackend() {
    try {
      const resposta = await getLoggedUser();
      salvarSessaoFrontend(resposta.usuario);
      return resposta.usuario;
    } catch (error) {
      limparSessaoFrontend();
      return null;
    }
  }

  async function logout() {
    try {
      return await requestJson(buildApiUrl('logout.php'), { method: 'GET' });
    } finally {
      limparSessaoFrontend();
    }
  }

  window.AuCheiApi = {
    requestJson,
    login,
    register,
    updateProfile,
    logout,
    getLoggedUser,
    syncSessionFromBackend,
    salvarSessaoFrontend,
    limparSessaoFrontend,
    buildApiUrl
  };
})();