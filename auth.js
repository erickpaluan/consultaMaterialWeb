import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// SUAS CREDENCIAIS DO SUPABASE AQUI
const supabaseUrl = "https://rlgsehxrpkxlavxdpzgz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ3NlaHhycGt4bGF2eGRwemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTY2MjgsImV4cCI6MjA2ODE3MjYyOH0.S_doyB0_3GuKRWCb0RXOXzTBvhsiEp_l9X0kWMt86Xg";

// Inicialize o Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const loginEmailInput = document.getElementById("login-email");
  const loginPasswordInput = document.getElementById("login-password");
  const loginBtn = document.getElementById("login-btn");

  // Função para mostrar/esconder o spinner e desabilitar o botão
  const toggleLoadingState = (button, isLoading) => {
    const spinner = button.querySelector(".spinner");
    const btnText = button.querySelector(".btn-text");
    if (isLoading) {
      spinner.classList.remove("hidden");
      btnText.classList.add("hidden");
      button.disabled = true;
    } else {
      spinner.classList.add("hidden");
      btnText.classList.remove("hidden");
      button.disabled = false;
    }
  };

  // Lógica de Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    toggleLoadingState(loginBtn, true);

    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    toggleLoadingState(loginBtn, false);

    if (error) {
      console.error("Erro de login:", error.message);
      Swal.fire({
        icon: "error",
        title: "Erro de Login",
        text: error.message,
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Login bem-sucedido!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        window.location.href = "index.html"; // Redireciona para a página principal
      });
    }
  });

  // Verifica o estado de autenticação ao carregar a página
  // Se o usuário já estiver logado, redireciona para index.html
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      window.location.href = "index.html";
    }
  });
});