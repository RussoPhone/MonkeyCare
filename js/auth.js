
defineAuthModalFunctions();

function defineAuthModalFunctions() {
  const modal = document.getElementById("modal-auth");
  const closeBtn = document.getElementById("close-auth");
  const tabs = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  window.abrirModalAuth = function (target = "login-form") {
    modal.style.display = "flex";
    tabs.forEach(btn => {
      const tab = document.getElementById(btn.dataset.target);
      if (btn.dataset.target === target) {
        btn.classList.add("active");
        tab.style.display = "block";
      } else {
        btn.classList.remove("active");
        tab.style.display = "none";
      }
    });
  };

  closeBtn?.addEventListener("click", () => modal.style.display = "none");
  tabs.forEach(btn => btn.addEventListener("click", () => abrirModalAuth(btn.dataset.target)));

  document.getElementById("btn-login")?.addEventListener("click", () => abrirModalAuth("login-form"));
  document.getElementById("btn-register")?.addEventListener("click", () => abrirModalAuth("register-form"));
}

const formLogin = document.getElementById("form-login");
formLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-senha").value.trim();
  const erroEl = document.getElementById("login-error");

  try {
    const res = await fetch(`http://localhost:3000/usuarios?email=${email}`);
    const usuarios = await res.json();
    const usuario = usuarios.find(u => u.senha === senha);

    if (!usuario) {
      erroEl.style.display = "block";
      erroEl.textContent = "E-mail ou senha incorretos.";
      return;
    }

    localStorage.setItem("mc_user", JSON.stringify(usuario));
    erroEl.style.display = "none";
    document.getElementById("modal-auth").style.display = "none";
    location.reload();
  } catch (err) {
    erroEl.style.display = "block";
    erroEl.textContent = "Erro de conexão com o servidor.";
  }
});

const formRegister = document.getElementById("form-register");
formRegister?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const novoUsuario = {
    nome: document.getElementById("reg-nome").value.trim(),
    email: document.getElementById("reg-email").value.trim(),
    senha: document.getElementById("reg-senha").value.trim(),
    cpf: document.getElementById("reg-cpf").value.trim(),
    endereco: document.getElementById("reg-endereco").value.trim(),
    celular: document.getElementById("reg-celular").value.trim()
  };

  try {
    const check = await fetch(`http://localhost:3000/usuarios?email=${novoUsuario.email}`);
    const exist = await check.json();
    if (exist.length > 0) {
      document.getElementById("email-error").textContent = "E-mail já cadastrado.";
      document.getElementById("email-error").style.display = "block";
      return;
    }

    const res = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario)
    });

    if (res.ok) {
      alert("Registro realizado com sucesso!");
      abrirModalAuth("login-form");
    }
  } catch (err) {
    document.getElementById("register-error").textContent = "Erro ao registrar.";
    document.getElementById("register-error").style.display = "block";
  }
});
