import { supabase } from "./supabaseClient.js";

const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const spinner = loginBtn.querySelector(".spinner");
const btnText = loginBtn.querySelector(".btn-text");

// Checa se o usuário já está logado ao carregar a página
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    window.location.href = "index.html"; // Se já tem sessão, vai para a home
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  // Mostra o spinner e desabilita o botão
  spinner.classList.remove("hidden");
  btnText.textContent = "Entrando...";
  loginBtn.disabled = true;

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  // Esconde o spinner e reabilita o botão
  spinner.classList.add("hidden");
  btnText.textContent = "Entrar";
  loginBtn.disabled = false;

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Erro de Login",
      text: "Email ou senha inválidos. Por favor, tente novamente.",
    });
  } else {
    // Redireciona para a página principal após o sucesso
    window.location.href = "index.html";
  }
});
