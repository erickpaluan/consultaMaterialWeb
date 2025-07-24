import { supabase } from "./services/supabaseClient.js";
import { ui } from "./uiElements.js";
import { initializeApp } from "./main.js";

let userRole = null;
let appInitialized = false;

// NOVO: Função para obter as iniciais do nome
const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.substring(0, 2).toUpperCase();
};

const toggleUIForAuthStatus = (user, profile) => {
  const isUserLoggedIn = !!user;

  ui.authenticatedContent.classList.toggle("hidden", !isUserLoggedIn);
  ui.unauthenticatedContent.classList.toggle("hidden", isUserLoggedIn);

  if (isUserLoggedIn && profile) {
    const fullName = profile.full_name || user.email;
    const role = profile.role === 'admin' ? 'Administrador' : 'Usuário';

    ui.userInitialsBtn.textContent = getInitials(fullName);
    ui.userFullname.textContent = fullName;
    ui.userEmailRole.textContent = `${user.email} (${role})`;
    
    ui.logoutBtn.classList.remove("hidden");

    const isAdmin = profile.role === "admin";
    ui.adminOnlyContent.forEach(el => el.classList.toggle("hidden", !isAdmin));

    if (!appInitialized) {
        initializeApp();
        appInitialized = true;
    }
  } else {
    ui.logoutBtn.classList.add("hidden");
  }
};

export const initializeAuth = () => {
  ui.logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });

  supabase.auth.onAuthStateChange(async (_event, session) => {
    const user = session?.user;

    if (!user) {
        userRole = null;
        appInitialized = false;
        if (window.location.pathname.includes('index.html') || window.location.pathname.includes('settings.html')) {
             window.location.href = "login.html";
        }
        return;
    }
    
    // Busca o perfil completo (nome e role)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
    }
    
    toggleUIForAuthStatus(user, profile);
  });
};