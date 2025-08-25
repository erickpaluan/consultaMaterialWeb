import { supabase } from "./services/supabaseClient.js";

const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const spinner = loginBtn.querySelector(".spinner");
const btnText = loginBtn.querySelector(".btn-text");

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    window.location.href = "index.html";
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  spinner.classList.remove("hidden");
  btnText.textContent = "Entrando...";
  loginBtn.disabled = true;

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

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
    window.location.href = "index.html";
  }
});
