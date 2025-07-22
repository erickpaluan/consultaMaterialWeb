import { supabase } from "./services/supabaseClient.js";
import { ui } from "./uiElements.js";
import { initializeApp } from "./main.js";

let userRole = null;
let appInitialized = false;

const toggleUIForAuthStatus = (user) => {
  const isUserLoggedIn = !!user;

  ui.authenticatedContent.classList.toggle("hidden", !isUserLoggedIn);
  ui.unauthenticatedContent.classList.toggle("hidden", isUserLoggedIn);

  if (isUserLoggedIn) {
    ui.userEmailSpan.textContent = user.email;
    ui.logoutBtn.classList.remove("hidden");

    const isAdmin = userRole === "admin";
    ui.adminOnlyContent.forEach(el => el.classList.toggle("hidden", !isAdmin));

    if (!appInitialized) {
        initializeApp();
        appInitialized = true;
    }
  } else {
    ui.userEmailSpan.textContent = "";
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
        if (window.location.pathname !== "/login.html") {
             window.location.href = "login.html";
        }
        return;
    }
    
    if (user && !userRole) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar role do usuário:", error);
        userRole = 'user';
      } else {
        userRole = profile?.role || "user";
      }
    }
    
    toggleUIForAuthStatus(user);
  });
};