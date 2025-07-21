// js/session.js

import { supabase } from "./supabaseClient.js";
import { ui } from "./uiElements.js";
import { fetchRetalhos } from "./retalhos.js";

let userRole = null; // Armazena o papel do usuário globalmente neste módulo

// Função que mostra/esconde a UI baseada no login e papel
const toggleUIForAuthStatus = (user) => {
  console.log("Usuário logado?", !!user);
  console.log("userRole:", userRole);
  console.log("authenticatedContent:", ui.authenticatedContent);
  console.log(
    "authenticatedContent.classList:",
    ui.authenticatedContent.classList
  );

  const isUserLoggedIn = !!user;

  ui.authenticatedContent.classList.toggle("hidden", !isUserLoggedIn);
  ui.unauthenticatedContent.classList.toggle("hidden", isUserLoggedIn);

  if (isUserLoggedIn) {
    ui.userEmailSpan.textContent = user.email;
    ui.logoutBtn.classList.remove("hidden");

    const isAdmin = userRole === "admin";
    ui.adminContent.classList.toggle("hidden", !isAdmin);
    ui.userContent.classList.toggle("hidden", isAdmin);

    ui.openRegisterModalBtn.classList.toggle("hidden", !isAdmin);
    ui.showReservedBtn.classList.remove("hidden");

    fetchRetalhos();
  } else {
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
export const initializeAuth = async () => {
  console.log("initializeAuth foi chamado");

  ui.logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "auth.html";
  });

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Erro ao obter sessão:", error);
  } else {
    console.log("Sessão atual:", data.session);
    toggleUIForAuthStatus(data.session?.user);
  }

  // Listener principal do Supabase que reage a LOGIN e LOGOUT
  supabase.auth.onAuthStateChange(async (_event, session) => {
    const user = session?.user;

    if (user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar role do usuário:", error);
      }

      userRole = profile?.role || "user";
    } else {
      userRole = null;
    }

    toggleUIForAuthStatus(user);
  });
};
