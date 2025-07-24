import { supabase } from "./services/supabaseClient.js";
import { ui } from "./uiElements.js";
import { initializeApp } from "./main.js";

let appInitialized = false;

const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.substring(0, 2).toUpperCase();
};

const updateUserUI = (user, profile) => {
    if (!user || !profile) return;

    const fullName = profile.full_name || user.email;
    const role = profile.role === 'admin' ? 'Administrador' : 'Usuário';

    ui.userInitialsBtn.textContent = getInitials(fullName);
    ui.userFullname.textContent = fullName;
    ui.userEmailRole.textContent = `${user.email} (${role})`;

    const isAdmin = profile.role === "admin";
    ui.adminOnlyContent.forEach(el => el.classList.toggle("hidden", !isAdmin));
};

const showApp = () => {
    ui.authenticatedContent.classList.remove("hidden");
    ui.unauthenticatedContent.classList.add("hidden");
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
            .from("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("Erro ao buscar perfil do usuário:", profileError);
            // Mesmo com erro no perfil, o usuário está logado. Podemos mostrar uma UI limitada.
            // Por enquanto, vamos redirecionar para o login para forçar uma nova tentativa.
            await supabase.auth.signOut(); // Limpa a sessão quebrada
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
    // Adiciona o listener para o botão de logout
    ui.logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut();
        // O listener onAuthStateChange abaixo cuidará do redirecionamento
    });
    
    // Ouve por mudanças futuras (como logout)
    supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            appInitialized = false;
            redirectToLogin();
        }
    });

    // **A MUDANÇA MAIS IMPORTANTE:**
    // Faz a verificação ativa da sessão assim que o script carrega.
    checkSession();
};