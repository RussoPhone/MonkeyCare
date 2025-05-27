// script.js

(() => {
  const slides = document.querySelectorAll('.slide');
  const btnNext = document.querySelector('.carrossel-controls .next');
  const btnPrev = document.querySelector('.carrossel-controls .prev');
  const modalCheckout = document.getElementById('modal-checkout');
  const closeCheckout = document.getElementById('close-checkout');
  const formCheckout = document.getElementById('formCheckout');
  const btnsSelecionar = document.querySelectorAll('.btn-selecionar');
  const listaCarrinho = document.getElementById('itens-carrinho');
  const totalEl = document.getElementById('total');
  const btnEncomendar = document.getElementById('btn-encomendar');
  const popupSucesso = document.getElementById('popup-sucesso');

  let carrinho = JSON.parse(sessionStorage.getItem('mc_cart')) || [];
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);

  showSlide(currentSlide);
  setInterval(nextSlide, 5000);

  function renderCarrinho() {
    if (!listaCarrinho) return;
    listaCarrinho.innerHTML = '';
    let total = 0;
    carrinho.forEach(item => {
      total += item.preco * item.qtd;
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.nome} x${item.qtd}</span><span>R$ ${(item.preco * item.qtd).toFixed(2)}</span><button class="btn-remove" data-nome="${item.nome}">&times;</button>`;
      listaCarrinho.appendChild(li);
    });
    totalEl.textContent = total.toFixed(2);
    document.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => removerDoCarrinho(btn.dataset.nome));
    });
  }

  function adicionarAoCarrinho(nome, preco) {
    const existente = carrinho.find(i => i.nome === nome);
    if (existente) existente.qtd++;
    else carrinho.push({ nome, preco, qtd: 1 });
    salvarCarrinho();
    renderCarrinho();
  }

  function removerDoCarrinho(nome) {
    carrinho = carrinho.filter(i => i.nome !== nome);
    salvarCarrinho();
    renderCarrinho();
  }

  function salvarCarrinho() {
    sessionStorage.setItem('mc_cart', JSON.stringify(carrinho));
  }

  closeCheckout?.addEventListener('click', () => modalCheckout.classList.remove('active'));
  window.addEventListener('click', e => {
    if (e.target === modalCheckout) modalCheckout.classList.remove('active');
  });

  formCheckout?.addEventListener('submit', (e) => {
    e.preventDefault();
    const endereco = document.getElementById('endereco').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const celular = document.getElementById('celular').value.trim();
    const pagamento = document.getElementById('pagamento').value;
    if (!endereco || !cpf || !celular || !pagamento) {
      alert('Preencha todos os campos!');
      return;
    }
    const user = JSON.parse(localStorage.getItem('mc_user'));
    const pedido = {
      usuarioId: user.id,
      endereco,
      cpf,
      celular,
      pagamento,
      itens: carrinho,
      total: carrinho.reduce((s, i) => s + i.preco * i.qtd, 0),
      status: 'pendente'
    };
    fetch('http://localhost:3000/encomendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    })
    .then(res => {
      if (!res.ok) throw new Error();
      alert('Pedido confirmado!');
      carrinho = [];
      salvarCarrinho();
      renderCarrinho();
      modalCheckout.classList.remove('active');
    })
    .catch(() => alert('Erro ao confirmar pedido.'));
  });

  btnsSelecionar.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.servico-card');
      const nome = card.dataset.nome;
      const preco = parseFloat(card.dataset.preco);
      adicionarAoCarrinho(nome, preco);
    });
  });

  btnEncomendar?.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('mc_user'));
    if (!user) {
      abrirModalAuth();
      return;
    }
    if (!carrinho.length) {
      alert('Carrinho vazio!');
      return;
    }
    modalCheckout.classList.add('active');
  });

  function showPopup() {
    if (!popupSucesso) return;
    popupSucesso.style.display = 'block';
    setTimeout(() => popupSucesso.style.display = 'none', 3000);
  }

  // Mostrar usuário logado
  const user = JSON.parse(localStorage.getItem("mc_user"));
  if (user) {
    document.querySelector(".auth-links").style.display = "none";
    const menu = document.querySelector(".user-menu");
    menu.style.display = "block";
    document.getElementById("user-name").innerText = user.nome;
  }

  renderCarrinho();
})();
document.addEventListener('DOMContentLoaded', () => {
  const btnEditar = document.getElementById('menu-editar');
  const modal = document.getElementById('modal-profile');
  const closeBtn = document.getElementById('close-profile');
  const form = document.getElementById('form-profile');

  if (!modal || !btnEditar || !closeBtn || !form) return;

  btnEditar.addEventListener('click', (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('mc_user'));
    if (!user) {
      alert('Você precisa estar logado para editar o perfil.');
      return;
    }

    // Preenche os campos
    document.getElementById('profile-endereco').value = user.endereco || '';
    document.getElementById('profile-celular').value = user.celular || '';
    document.getElementById('profile-pagamento').value = user.pagamento || '';
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('mc_user'));
    if (!user) {
      alert('Usuário não encontrado.');
      return;
    }

    const atualizado = {
      ...user,
      endereco: document.getElementById('profile-endereco').value.trim(),
      celular: document.getElementById('profile-celular').value.trim(),
      pagamento: document.getElementById('profile-pagamento').value
    };

    try {
      const res = await fetch(`http://localhost:3000/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(atualizado)
      });

      if (!res.ok) throw new Error('Erro no servidor');

      localStorage.setItem('mc_user', JSON.stringify(atualizado));
      document.getElementById('user-name').innerText = atualizado.nome;
      alert('Perfil atualizado com sucesso!');
      modal.style.display = 'none';

    } catch (err) {
      alert('Falha ao atualizar perfil: ' + err.message);
    }
  });
});
  document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('mc_user'));
    const btnUserMenu = document.getElementById('btn-user-menu');
    const menuOptions = document.getElementById('menu-options');
    const menuLogout = document.getElementById('menu-logout');
    const authLinks = document.querySelector('.auth-links');
    const userMenu = document.querySelector('.user-menu');
    const userNameSpan = document.getElementById('user-name');

    // Mostrar ou esconder menus com base na autenticação
    if (user) {
      authLinks?.style.setProperty('display', 'none');
      userMenu?.style.setProperty('display', 'block');
      userNameSpan.textContent = user.nome;
    } else {
      authLinks?.style.setProperty('display', 'flex');
      userMenu?.style.setProperty('display', 'none');
    }

    // Alternar menu do usuário
    btnUserMenu?.addEventListener('click', (e) => {
      e.stopPropagation();
      menuOptions.style.display = menuOptions.style.display === 'block' ? 'none' : 'block';
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!menuOptions.contains(e.target) && !btnUserMenu.contains(e.target)) {
        menuOptions.style.display = 'none';
      }
    });

    // Logout
    menuLogout?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('mc_user');
      window.location.reload();
    });

    // Ocultar blocos de autenticação duplicados se existirem
    const authBlocks = document.querySelectorAll('.auth-links');
    if (authBlocks.length > 1) {
      for (let i = 1; i < authBlocks.length; i++) {
        authBlocks[i].style.display = 'none';
      }
    }

    // Remover item 'Editar Perfil' do menu do usuário
    const itemEditar = document.getElementById('menu-editar');
    itemEditar?.parentElement?.remove();
  });
  document.addEventListener('DOMContentLoaded', () => {
  const formCheckout = document.getElementById('formCheckout');
  const modalCheckout = document.getElementById('modal-checkout');
  const closeCheckout = document.getElementById('close-checkout');
  const btnEncomendar = document.getElementById('btn-encomendar');

  // Ativar botão se logado
  const user = JSON.parse(localStorage.getItem('mc_user'));
  if (user && btnEncomendar) {
    btnEncomendar.removeAttribute('disabled');
    document.getElementById('login-prompt')?.remove();
  }

  // Abrir modal
  btnEncomendar?.addEventListener('click', () => {
    if (!user) return;
    modalCheckout.style.display = 'flex';
  });

  // Fechar modal
  closeCheckout?.addEventListener('click', () => {
    modalCheckout.style.display = 'none';
  });

  // Submissão do pedido
  formCheckout?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pedido = {
      usuarioId: user?.id,
      endereco: document.getElementById('endereco').value.trim(),
      cpf: document.getElementById('cpf').value.trim(),
      celular: document.getElementById('celular').value.trim(),
      pagamento: document.getElementById('pagamento').value,
      itens: JSON.parse(sessionStorage.getItem('mc_cart') || '[]'),
      total: JSON.parse(sessionStorage.getItem('mc_cart') || '[]').reduce((acc, item) => acc + item.preco * item.qtd, 0),
      status: 'pendente'
    };

    fetch('http://localhost:3000/encomendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    })
    .then(res => {
      if (!res.ok) throw new Error();
      alert('Pedido enviado com sucesso!');
      sessionStorage.removeItem('mc_cart');
      modalCheckout.style.display = 'none';
      location.reload();
    })
    .catch(() => alert('Erro ao enviar pedido.'));
  });
});
