import { supabase } from "./services/supabaseClient.js";

// --- ELEMENTOS DO DOM ---
const adminContainer = document.getElementById('admin-container');
const createUserForm = document.getElementById('create-user-form');
const userListLoader = document.getElementById('user-list-loader');
const userListContainer = document.getElementById('user-list-container');
const userListTable = userListContainer.querySelector('table');
const userListBody = document.getElementById('user-list-body');
let currentUser = null;

// --- FUNÇÕES DE RENDERIZAÇÃO ---
function renderUsers(users) {
    userListBody.innerHTML = ''; // Limpa a lista antiga
    if (users && users.length > 0) {
        users.forEach(user => {
            const isCurrentUser = user.id === currentUser.id;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">${user.full_name || ''}</div></td>
                <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-700">${user.email}</div></td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">${user.role}</span></td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${user.status}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button ${isCurrentUser ? 'disabled' : ''} data-id="${user.id}" data-current-role="${user.role}" class="edit-role-btn text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed" title="Alterar Cargo">Editar Cargo</button>
                    <button ${isCurrentUser ? 'disabled' : ''} data-id="${user.id}" data-current-status="${user.status}" class="toggle-status-btn ${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} disabled:opacity-50 disabled:cursor-not-allowed" title="${user.status === 'active' ? 'Bloquear' : 'Desbloquear'}">
                        ${user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                    </button>
                </td>
            `;
            userListBody.appendChild(tr);
        });
        userListTable.classList.remove('hidden');
    } else {
        userListContainer.innerHTML = '<p class="text-center text-gray-500">Nenhum usuário encontrado.</p>';
    }
    userListLoader.classList.add('hidden');
}

// --- LÓGICA DE DADOS (CHAMADAS ÀS EDGE FUNCTIONS) ---
async function loadUsers() {
    userListLoader.classList.remove('hidden');
    userListTable.classList.add('hidden');
    const { data, error } = await supabase.functions.invoke('list-users');
    if (error) {
        Swal.fire('Erro', 'Não foi possível carregar a lista de usuários.', 'error');
        userListLoader.textContent = 'Erro ao carregar usuários.';
        console.error('Erro ao carregar usuários:', error);
    } else {
        renderUsers(data);
    }
}

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

async function handleEditRole(e) {
    const btn = e.target.closest('.edit-role-btn');
    if (!btn) return;
    const userId = btn.dataset.id;
    const currentRole = btn.dataset.currentRole;
    
    const { value: newRole } = await Swal.fire({
        title: 'Alterar Cargo do Usuário',
        input: 'select',
        inputOptions: { 'user': 'Usuário', 'admin': 'Administrador' },
        inputValue: currentRole,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar'
    });

    if (newRole && newRole !== currentRole) {
        const { error } = await supabase.functions.invoke('update-user', { body: { userId, role: newRole } });
        if (error) {
            Swal.fire('Erro', 'Não foi possível alterar o cargo do usuário.', 'error');
            console.error('Erro ao atualizar cargo:', error);
        } else {
            Swal.fire('Sucesso!', 'Cargo atualizado com sucesso!', 'success');
            loadUsers(); // Recarrega a lista
        }
    }
}

async function handleToggleStatus(e) {
    const btn = e.target.closest('.toggle-status-btn');
    if (!btn) return;
    const userId = btn.dataset.id;
    const currentStatus = btn.dataset.currentStatus;
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const actionText = newStatus === 'blocked' ? 'bloquear' : 'desbloquear';

    const { isConfirmed } = await Swal.fire({
        title: `Tem certeza que deseja ${actionText} este usuário?`,
        text: newStatus === 'blocked' ? 'O usuário não poderá mais fazer login.' : 'O usuário poderá fazer login novamente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Sim, ${actionText}`,
        cancelButtonText: 'Cancelar'
    });

    if (isConfirmed) {
        const { error } = await supabase.functions.invoke('update-user', { body: { userId, status: newStatus } });
        if (error) {
            Swal.fire('Erro', `Não foi possível ${actionText} o usuário.`, 'error');
        } else {
            Swal.fire('Sucesso!', `Usuário foi ${actionText} com sucesso!`, 'success');
            loadUsers(); // Recarrega a lista
        }
    }
}

// --- VERIFICAÇÃO DE PERMISSÃO E INICIALIZAÇÃO ---
async function checkAdminAccess() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = user; // Guarda o usuário atual para verificações

    const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (error || profile.role !== 'admin') {
        Swal.fire({
            icon: 'error', title: 'Acesso Negado', text: 'Você não tem permissão para acessar esta página.', timer: 2000, showConfirmButton: false
        }).then(() => { window.location.href = 'index.html'; });
    } else {
        adminContainer.classList.remove('hidden');
        loadUsers(); // Carrega a lista de usuários se for admin
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    createUserForm.addEventListener('submit', handleCreateUser);
    userListBody.addEventListener('click', handleEditRole);
    userListBody.addEventListener('click', handleToggleStatus);
});