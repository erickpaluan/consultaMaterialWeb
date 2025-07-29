import { supabase } from "./services/supabaseClient.js";

// --- ELEMENTOS DO DOM ---
const adminContainer = document.getElementById('admin-container');
const createUserForm = document.getElementById('create-user-form');

// --- VERIFICAÇÃO DE PERMISSÃO ---
async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (error || profile.role !== 'admin') {
        // Se não for admin, redireciona para a página principal
        Swal.fire({
            icon: 'error',
            title: 'Acesso Negado',
            text: 'Você não tem permissão para acessar esta página.',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = 'index.html';
        });
    } else {
        // Se for admin, mostra o conteúdo da página
        adminContainer.classList.remove('hidden');
    }
}

// --- LÓGICA DE CRIAÇÃO DE USUÁRIO ---
async function handleCreateUser(e) {
    e.preventDefault();
    const btn = document.getElementById('create-user-btn');
    
    const userData = {
        fullName: document.getElementById('new-user-name').value,
        email: document.getElementById('new-user-email').value,
        password: document.getElementById('new-user-password').value,
        role: document.getElementById('new-user-role').value,
    };

    // Validação simples
    if (!userData.email || !userData.password || !userData.fullName) {
        Swal.fire('Atenção', 'Por favor, preencha todos os campos.', 'warning');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Criando...';

    // Chama a Edge Function 'create-user'
    const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData,
    });

    if (error) {
        Swal.fire('Erro', `Não foi possível criar o usuário: ${error.message}`, 'error');
    } else {
        Swal.fire('Sucesso!', data.message, 'success');
        createUserForm.reset(); // Limpa o formulário
        // Futuramente, aqui você chamaria uma função para recarregar a lista de usuários
    }

    btn.disabled = false;
    btn.textContent = 'Criar Usuário';
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    createUserForm.addEventListener('submit', handleCreateUser);
});