import { supabase } from "./services/supabaseClient.js";

const settingsContainer = document.getElementById('settings-container');
const settingsForm = document.getElementById('settings-form');
const emailDisplay = document.getElementById('user-email-display');
const fullNameInput = document.getElementById('full-name-input');
const saveBtn = document.getElementById('save-settings-btn');
const spinner = saveBtn.querySelector('.spinner');
const btnText = saveBtn.querySelector('.btn-text');

let currentUser = null;

async function loadUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = user;
    settingsContainer.classList.remove('hidden');
    emailDisplay.textContent = user.email;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Erro ao buscar perfil:', error);
    } else if (profile) {
        fullNameInput.value = profile.full_name || '';
    }
}

async function handleSaveSettings(e) {
    e.preventDefault();
    const newName = fullNameInput.value.trim();

    spinner.classList.remove('hidden');
    btnText.textContent = 'Salvando...';
    saveBtn.disabled = true;

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: newName })
        .eq('id', currentUser.id);

    spinner.classList.add('hidden');
    btnText.textContent = 'Salvar Alterações';
    saveBtn.disabled = false;

    if (error) {
        Swal.fire('Erro', 'Não foi possível salvar as alterações.', 'error');
    } else {
        Swal.fire('Sucesso!', 'Seu nome foi atualizado.', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    settingsForm.addEventListener('submit', handleSaveSettings);
});