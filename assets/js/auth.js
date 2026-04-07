(function () {
  const { qs, toast } = window.AuCheiUtils;
  const { login, register, logout } = window.AuCheiApi;

  const REGEX = {
    nome: /^[A-Za-zÀ-ÿ0-9\s'.-]{3,100}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    telefone: /^\d{10,11}$/,
    cidadeUf: /^[A-Za-zÀ-ÿ\s'-]{2,100},\s?[A-Za-z]{2}$/,
    senhaForte: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/
  };

  function limparTelefone(valor) {
    return (valor || '').replace(/\D/g, '');
  }

  function obterBoxMensagem(form) {
    let box = form.querySelector('.auth-form-message');

    if (!box) {
      box = document.createElement('div');
      box.className = 'auth-form-message';
      box.style.marginBottom = '12px';
      box.style.padding = '10px 12px';
      box.style.borderRadius = '8px';
      box.style.fontSize = '14px';
      box.style.display = 'none';
      box.style.lineHeight = '1.4';

      form.prepend(box);
    }

    return box;
  }

  function mostrarMensagemFormulario(form, mensagem, tipo = 'error') {
    const box = obterBoxMensagem(form);

    box.textContent = mensagem;
    box.style.display = 'block';

    if (tipo === 'success') {
      box.style.backgroundColor = '#e8f7ee';
      box.style.border = '1px solid #8fd3a8';
      box.style.color = '#17663a';
    } else {
      box.style.backgroundColor = '#fdecec';
      box.style.border = '1px solid #f2a7a7';
      box.style.color = '#8a1f1f';
    }
  }

  function limparMensagemFormulario(form) {
    const box = form.querySelector('.auth-form-message');
    if (!box) return;

    box.textContent = '';
    box.style.display = 'none';
  }

  function mostrarErro(form, mensagem) {
    mostrarMensagemFormulario(form, mensagem, 'error');
    toast(mensagem, 'error');
  }

  function mostrarSucesso(form, mensagem) {
    mostrarMensagemFormulario(form, mensagem, 'success');
    toast(mensagem);
  }

  function validarLoginData(data) {
    if (!data.email || !data.password) {
      return 'Preencha e-mail e senha.';
    }

    if (!REGEX.email.test(data.email)) {
      return 'Informe um e-mail válido.';
    }

    if (data.password.length < 6) {
      return 'Senha inválida.';
    }

    return null;
  }

  function validarRegisterData(data) {
    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
      return 'Preencha os campos obrigatórios.';
    }

    if (!REGEX.nome.test(data.name)) {
      return 'Informe um nome válido com no mínimo 3 caracteres.';
    }

    if (!REGEX.email.test(data.email)) {
      return 'Informe um e-mail válido.';
    }

    const telefoneLimpo = limparTelefone(data.phone);
    if (data.phone && !REGEX.telefone.test(telefoneLimpo)) {
      return 'Informe um telefone válido com 10 ou 11 dígitos.';
    }

    if (data.city && !REGEX.cidadeUf.test(data.city)) {
      return 'Informe a cidade no formato Cidade, UF.';
    }

    if (data.bio && data.bio.length > 255) {
      return 'A bio deve ter no máximo 255 caracteres.';
    }

    if (!REGEX.senhaForte.test(data.password)) {
      return 'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.';
    }

    if (data.password !== data.confirmPassword) {
      return 'As senhas não coincidem.';
    }

    return null;
  }

  function initLogin() {
    const form = qs('#login-form');
    if (!form || form.dataset.authBound === 'true') return;
    form.dataset.authBound = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      limparMensagemFormulario(form);

      const fd = new FormData(form);
      const data = {
        email: fd.get('email')?.toString().trim() || '',
        password: fd.get('password')?.toString() || ''
      };

      const erroValidacao = validarLoginData(data);
      if (erroValidacao) {
        mostrarErro(form, erroValidacao);
        return;
      }

      const botao = form.querySelector('button[type="submit"]');
      const textoOriginal = botao?.textContent || 'Entrar agora';

      if (botao) {
        botao.disabled = true;
        botao.textContent = 'Entrando...';
      }

      try {
        const resposta = await login(data);
        mostrarSucesso(form, resposta.mensagem || 'Login realizado com sucesso!');

        setTimeout(() => {
          window.location.href = 'perfil.html';
        }, 500);
      } catch (error) {
        mostrarErro(form, error.message || 'Não foi possível entrar.');
      } finally {
        if (botao) {
          botao.disabled = false;
          botao.textContent = textoOriginal;
        }
      }
    });
  }

  function initRegister() {
    const form = qs('#register-form');
    if (!form || form.dataset.authBound === 'true') return;
    form.dataset.authBound = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      limparMensagemFormulario(form);

      const fd = new FormData(form);
      const data = {
        name: fd.get('name')?.toString().trim() || '',
        email: fd.get('email')?.toString().trim() || '',
        password: fd.get('password')?.toString() || '',
        phone: fd.get('phone')?.toString().trim() || '',
        city: fd.get('city')?.toString().trim() || '',
        bio: fd.get('bio')?.toString().trim() || '',
        confirmPassword: fd.get('confirmPassword')?.toString() || ''
      };

      const erroValidacao = validarRegisterData(data);
      if (erroValidacao) {
        mostrarErro(form, erroValidacao);
        return;
      }

      const botao = form.querySelector('button[type="submit"]');
      const textoOriginal = botao?.textContent || 'Criar conta';

      if (botao) {
        botao.disabled = true;
        botao.textContent = 'Criando...';
      }

      try {
        const resposta = await register({
          ...data,
          phone: limparTelefone(data.phone)
        });

        mostrarSucesso(form, resposta.mensagem || 'Conta criada com sucesso!');

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 600);
      } catch (error) {
        mostrarErro(form, error.message || 'Não foi possível criar a conta.');
      } finally {
        if (botao) {
          botao.disabled = false;
          botao.textContent = textoOriginal;
        }
      }
    });
  }

  function initLogout() {
    const btnLogout = document.getElementById('logout-button');
    if (!btnLogout || btnLogout.dataset.logoutBound === 'true') return;
    btnLogout.dataset.logoutBound = 'true';

    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        const resposta = await logout();
        toast(resposta?.mensagem || 'Logout realizado com sucesso!');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 350);
      } catch (error) {
        console.error('Erro no logout:', error);
        toast(error.message || 'Erro ao sair.', 'error');
      }
    });
  }

  window.AuCheiAuth = {
    initLogin,
    initRegister,
    initLogout
  };
})();