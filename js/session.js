import { supabase } from "./services/supabaseClient.js";
import { SELECTORS } from "./selectors.js";
import { initializeApp } from "./main.js";
import { setState } from "./state.js";

let appInitialized = false;

const get = (selector) => document.querySelector(selector);
const getAll = (selector) => document.querySelectorAll(selector);

const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.substring(0, 2).toUpperCase();
};

const updateUserUI = (user, profile) => {
    if (!user || !profile) return;
    setState({ currentUser: { id: user.id, email: user.email, role: profile.role, fullName: profile.full_name } });

    const fullName = profile.full_name || user.email;
    const role = profile.role === 'admin' ? 'Administrador' : 'Usuário';

    get(SELECTORS.userInitialsBtn).textContent = getInitials(fullName);
    get(SELECTORS.userFullname).textContent = fullName;
    get(SELECTORS.userEmailRole).textContent = `${user.email} (${role})`;

    const isAdmin = profile.role === "admin";
    getAll(SELECTORS.adminOnlyContent).forEach(el => el.classList.toggle("hidden", !isAdmin));
};

const showApp = () => {
    get(SELECTORS.authenticatedContent).classList.remove("hidden");
    get(SELECTORS.unauthenticatedContent).classList.add("hidden");
    if (!appInitialized) {
        initializeApp();
        appInitialized = true;
    }
};

const redirectToLogin = () => {
    const onLoginPage = window.location.pathname.includes('login.html');
    if (!onLoginPage) {
        window.location.href = "login.html";
    }
};

const checkSession = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        console.error("Erro ao obter a sessão:", sessionError);
        redirectToLogin();
        return;
    }
    if (session) {
        const user = session.user;
        const { data: profile, error: profileError } = await supabase
            .from("profiles").select("role, full_name").eq("id", user.id).single();
        if (profileError) {
            console.error("Erro ao buscar perfil do usuário:", profileError);
            await supabase.auth.signOut();
            redirectToLogin();
            return;
        }
        updateUserUI(user, profile);
        showApp();
    } else {
        redirectToLogin();
    }
};

export const initializeAuth = () => {
    const logoutBtn = get(SELECTORS.logoutBtn);
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await supabase.auth.signOut();
        });
    }
    
    supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            appInitialized = false;
            redirectToLogin();
        }
    });
    
    checkSession();
};