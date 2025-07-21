// js/session.js

import { supabase } from "./supabaseClient.js";
import { ui } from "./uiElements.js";
import { fetchRetalhos } from "./retalhos.js";

let userRole = null; // Armazena o papel do usuário globalmente neste módulo

// Função que mostra/esconde a UI baseada no login e papel
const toggleUIForAuthStatus = (user) => {
  const isUserLoggedIn = !!user; // Converte para booleano (true/false)

  // Controla os containers principais
  ui.authenticatedContent.classList.toggle("hidden", !isUserLoggedIn);
  ui.unauthenticatedContent.classList.toggle("hidden", isUserLoggedIn);

  if (isUserLoggedIn) {
    // Usuário logado
    ui.userEmailSpan.textContent = user.email;
    ui.logoutBtn.classList.remove("hidden");

    // Controla o conteúdo específico por papel (role)
    const isAdmin = userRole === "admin";
    ui.adminContent.classList.toggle("hidden", !isAdmin);
    ui.userContent.classList.toggle("hidden", isAdmin);

    // Controla botões de ação
    ui.openRegisterModalBtn.classList.toggle("hidden", !isAdmin);
    ui.showReservedBtn.classList.remove("hidden");

    // Busca os dados iniciais
    fetchRetalhos();
  } else {
    // Usuário deslogado
    ui.userEmailSpan.textContent = "";
    ui.logoutBtn.classList.add("hidden");
    ui.adminContent.classList.add("hidden");
    ui.userContent.classList.add("hidden");
    ui.openRegisterModalBtn.classList.add("hidden");
    ui.showReservedBtn.classList.add("hidden");
  }
};

export const getCurrentUserRole = () => userRole;

// Função principal que inicializa o gerenciamento de sessão
export const initializeAuth = () => {
  // Evento do botão de logout
  ui.logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    // DICA DE UX: Redireciona direto para a página de login!
    window.location.href = "auth.html";
  });

  // Listener principal do Supabase que reage a LOGIN e LOGOUT
  supabase.auth.onAuthStateChange(async (_event, session) => {
    const user = session?.user;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = profile?.role || "user"; // Garante um papel padrão
    } else {
      userRole = null;
    }

    // Atualiza toda a interface de uma vez
    toggleUIForAuthStatus(user);
  });
};
