import * as api from './services/api.js';
import * as dom from './ui/dom.js';
import { ui } from './uiElements.js';
import { openModal, closeModal } from './ui/modals.js';
import { getState, setState, updateFilters, resetFilters, setSort } from './state.js';
import { ITEMS_PER_PAGE } from './config.js';
import { debounce } from './utils.js';

let currentRetalhoToEdit = null;

// --- VALIDAÇÃO ---
function validateRegisterForm() {
    const form = ui.registerForm;
    const requiredFields = [
        form.elements['reg-numero'], form.elements['reg-gaveta'], form.elements['reg-material'],
        form.elements['reg-tipo'], form.elements['reg-espessura'], form.elements['reg-comprimento'],
        form.elements['reg-largura'], form.elements['reg-quantidade']
    ];
    
    let isValid = true;
    for (const field of requiredFields) {
        field.classList.remove('border-red-500');
        if (!field.value) {
            field.classList.add('border-red-500');
            isValid = false;
        }
    }
    
    if (!isValid) {
        Swal.fire('Atenção', 'Por favor, preencha todos os campos obrigatórios (marcados em vermelho).', 'warning');
    }
    return isValid;
}


// --- FILTROS E CONSULTA PRINCIPAL ---
const debouncedLoadRetalhos = debounce(() => handleLoadRetalhos(), 400);

async function handleLoadRetalhos() {
    dom.toggleLoader(true);
    const state = getState();
    const pagination = { currentPage: state.currentPage, itemsPerPage: ITEMS_PER_PAGE };
    const { data, error, count } = await api.fetchRetalhos(state.filters, pagination, state.sort);
    
    if (error) {
        console.error("Erro ao carregar retalhos:", error);
        Swal.fire("Erro", "Não foi possível carregar os retalhos.", "error");
    } else {
        // A CORREÇÃO ESTÁ AQUI:
        setState({ totalItems: count }); // <-- A LINHA QUE FALTAVA
        
        dom.renderRetalhos(data || []);
        dom.updatePagination(state.currentPage, count, ITEMS_PER_PAGE);
    }
    dom.toggleLoader(false);
}

function handleFilterFormChange() {
    updateFilters();
    dom.toggleClearButtonVisibility();
    debouncedLoadRetalhos();
}

function handleClearFilters() {
    resetFilters();
    dom.resetFilterForm();
    handleLoadRetalhos();
    handleLoadFilterOptions();
}

function handlePageChange(direction) {
    const state = getState();
    const totalPages = Math.ceil(state.totalItems / ITEMS_PER_PAGE);
    let newPage = state.currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        setState({ currentPage: newPage });
        handleLoadRetalhos();
    }
}

function handleSort(event) {
    const header = event.target.closest('th[data-sort]');
    if (!header) return;
    const newSortColumn = header.dataset.sort;
    setSort(newSortColumn);
    const { sort } = getState();
    dom.updateSortVisuals(sort.column, sort.direction);
    handleLoadRetalhos();
}

async function handleLoadFilterOptions() {
    const { data: materials } = await api.fetchDistinctField('material');
    if (materials) {
        dom.populateSelect(ui.materialSelect, [...new Set(materials.map(m => m.material))].filter(Boolean), { defaultOption: 'Todos' });
    }
    const state = getState();
    if(state.filters.material) await handleLoadTiposParaFiltro();
    if(state.filters.tipo) await handleLoadEspessurasParaFiltro();
}

async function handleLoadTiposParaFiltro() {
    const material = ui.materialSelect.value;
    dom.populateSelect(ui.espessuraSelect, [], { defaultOption: 'Todas as Espessuras' });
    if(!material) {
        dom.populateSelect(ui.tipoSelect, [], { defaultOption: 'Todos os Tipos' });
        return;
    }
    const { data: tipos } = await api.fetchDistinctFieldWhere('tipo', { material });
    if (tipos) {
        dom.populateSelect(ui.tipoSelect, [...new Set(tipos.map(t => t.tipo))].filter(Boolean), { defaultOption: 'Todos os Tipos' });
    }
    await handleLoadEspessurasParaFiltro();
}

async function handleLoadEspessurasParaFiltro() {
    const material = ui.materialSelect.value;
    const tipo = ui.tipoSelect.value;
    const { data: espessuras } = await api.fetchDistinctFieldWhere('espessura', { material, tipo }, false);
    if(espessuras) {
        const options = [...new Set(espessuras.map(e => e.espessura))].filter(Boolean).sort((a,b) => a-b);
        const formattedOptions = options.map(e => ({ value: e, text: `${e}mm`}));
        dom.populateSelect(ui.espessuraSelect, formattedOptions, { defaultOption: 'Todas as Espessuras', valueKey: 'value', textKey: 'text' });
    }
}


// --- CADASTRO E EDIÇÃO DE RETALHOS ---
async function setupRegisterModal(mode = 'add', retalhoData = null) {
    dom.resetRegisterForm();
    currentRetalhoToEdit = retalhoData;

    const isEditMode = mode === 'edit';
    ui.registerModalTitle.textContent = isEditMode ? 'Editar Retalho' : 'Cadastrar Novo Retalho';
    ui.regSubmitBtnText.textContent = isEditMode ? 'Salvar Alterações' : 'Cadastrar';
    ui.editRetalhoId.value = isEditMode ? retalhoData.id : '';

    const { data } = await api.fetchDistinctField('material');
    const materialNames = data ? [...new Set(data.map(m => m.material))].filter(Boolean) : [];
    setState({ existingMaterials: materialNames.map(m => m.toLowerCase()) });
    dom.populateSelect(ui.regMaterialSelect, materialNames, { defaultOption: 'Selecione...', addOptions: [`<option value="novo-material">-- Novo Material --</option>`] });

    if (isEditMode) {
        ui.regNumero.value = retalhoData.numero;
        ui.regGaveta.value = retalhoData.gaveta;
        ui.regQuantidade.value = retalhoData.quantidade;
        ui.regMaterialSelect.value = retalhoData.material;
        await handleMaterialCadastroChange();
        ui.regTipoSelect.value = retalhoData.tipo;
        ui.regEspessura.value = retalhoData.espessura;
        ui.regComprimento.value = retalhoData.comprimento;
        ui.regLargura.value = retalhoData.largura;
        ui.regObs.value = retalhoData.obs || '';
    } else {
        dom.populateSelect(ui.regTipoSelect, [], { defaultOption: 'Selecione um material...', addOptions: [`<option value="novo-tipo">-- Novo Tipo --</option>`] });
    }

    openModal(ui.registerModal);
}

async function handleOpenRegisterModal() {
    await setupRegisterModal('add');
}

async function handleOpenEditModal(event) {
    const button = event.target.closest('.edit-btn');
    if (!button) return;
    const retalhoId = button.dataset.id;
    const { data, error } = await api.fetchFullRetalhoById(retalhoId);
    if(error) {
        return Swal.fire('Erro', 'Não foi possível carregar os dados do retalho para edição.', 'error');
    }
    await setupRegisterModal('edit', data);
}

async function handleMaterialCadastroChange() {
    const selectedMaterial = ui.regMaterialSelect.value;
    ui.regNovoMaterialContainer.classList.add('hidden');
    ui.regNovoTipoContainer.classList.add('hidden');

    if (selectedMaterial === 'novo-material') {
        ui.regNovoMaterialContainer.classList.remove('hidden');
        ui.regNovoMaterialInput.focus();
        dom.populateSelect(ui.regTipoSelect, [], { defaultOption: 'Salve o novo material' });
    } else if (selectedMaterial) {
        const { data } = await api.fetchDistinctFieldWhere('tipo', { material: selectedMaterial });
        const tipoNames = data ? [...new Set(data.map(t => t.tipo))].filter(Boolean) : [];
        setState({ existingTypes: tipoNames.map(t => t.toLowerCase()) });
        dom.populateSelect(ui.regTipoSelect, tipoNames, { defaultOption: 'Selecione...', addOptions: [`<option value="novo-tipo">-- Novo Tipo --</option>`] });
    } else {
        dom.populateSelect(ui.regTipoSelect, [], { defaultOption: 'Selecione um material...' });
    }
}

function handleTipoCadastroChange() {
    if (ui.regTipoSelect.value === 'novo-tipo') {
        ui.regNovoTipoContainer.classList.remove('hidden');
        ui.regNovoTipoInput.focus();
    } else {
        ui.regNovoTipoContainer.classList.add('hidden');
    }
}

function addAndSelectOption(selectElement, value) {
    const newOption = document.createElement("option");
    newOption.value = value;
    newOption.textContent = value;
    const lastOption = selectElement.querySelector('option[value^="novo-"]');
    selectElement.insertBefore(newOption, lastOption);
    selectElement.value = value;
}

function handleSalvarNovoMaterial() {
    const novoMaterial = ui.regNovoMaterialInput.value.trim();
    if (!novoMaterial) return Swal.fire("Atenção", "O nome do novo material não pode ser vazio.", "warning");
    const { existingMaterials } = getState();
    if (existingMaterials.includes(novoMaterial.toLowerCase())) return Swal.fire("Atenção", "Este material já existe.", "warning");
    
    addAndSelectOption(ui.regMaterialSelect, novoMaterial);
    existingMaterials.push(novoMaterial.toLowerCase());
    ui.regNovoMaterialContainer.classList.add('hidden');
    ui.regNovoMaterialInput.value = '';
    handleMaterialCadastroChange();
}

function handleSalvarNovoTipo() {
    const novoTipo = ui.regNovoTipoInput.value.trim();
    if (!novoTipo) return Swal.fire("Atenção", "O nome do novo tipo não pode ser vazio.", "warning");
    const { existingTypes } = getState();
    if (existingTypes.includes(novoTipo.toLowerCase())) return Swal.fire("Atenção", "Este tipo já existe para este material.", "warning");
    
    addAndSelectOption(ui.regTipoSelect, novoTipo);
    existingTypes.push(novoTipo.toLowerCase());
    ui.regNovoTipoContainer.classList.add('hidden');
    ui.regNovoTipoInput.value = '';
}

function handleClearRegisterForm() {
    const isEditMode = !!ui.editRetalhoId.value;
    if(isEditMode && currentRetalhoToEdit) {
        setupRegisterModal('edit', currentRetalhoToEdit);
    } else {
        dom.resetRegisterForm();
        handleMaterialCadastroChange();
    }
}

async function handleRegisterSubmit() {
    if (!validateRegisterForm()) return;
    
    const form = ui.registerForm;
    const submitBtn = ui.regSubmitBtn;
    const isEditMode = !!form.elements['edit-retalho-id'].value;
    dom.toggleSubmitButton(submitBtn, true, isEditMode ? 'Salvando...' : 'Cadastrando...');
    
    const { currentUser } = getState();
    
    let materialValue = form.elements['reg-material'].value;
    if (materialValue === 'novo-material') materialValue = form.elements['reg-novo-material-input'].value.trim();
    let tipoValue = form.elements['reg-tipo'].value;
    if (tipoValue === 'novo-tipo') tipoValue = form.elements['reg-novo-tipo-input'].value.trim();

    const retalhoData = {
      numero: parseFloat(form.elements['reg-numero'].value), gaveta: form.elements['reg-gaveta'].value,
      material: materialValue, tipo: tipoValue, espessura: parseFloat(form.elements['reg-espessura'].value),
      comprimento: parseFloat(form.elements['reg-comprimento'].value), largura: parseFloat(form.elements['reg-largura'].value),
      quantidade: parseInt(form.elements['reg-quantidade'].value, 10), obs: form.elements['reg-obs'].value || null,
    };

    let result;
    if (isEditMode) {
        const id = form.elements['edit-retalho-id'].value;
        result = await api.updateRetalho(id, retalhoData);
        result.data = { id };
    } else {
        result = await api.createRetalho({ ...retalhoData, reservado: false });
    }

    if(result.error) {
        console.error(`Erro ao ${isEditMode ? 'editar' : 'cadastrar'} retalho:`, result.error);
        Swal.fire('Erro', `Não foi possível ${isEditMode ? 'salvar as alterações' : 'cadastrar o retalho'}.`, 'error');
    } else {
        const logData = {
            retalho_id: result.data.id,
            user_id: currentUser.id,
            user_email: currentUser.email,
            acao: isEditMode ? 'EDICAO' : 'CRIACAO',
            detalhes: isEditMode ? 'Retalho editado.' : 'Novo retalho cadastrado.'
        };
        await api.registrarAuditoria(logData);

        Swal.fire('Sucesso!', `Retalho ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        closeModal(ui.registerModal);
        handleLoadRetalhos();
        handleLoadFilterOptions();
    }
    dom.toggleSubmitButton(submitBtn, false, isEditMode ? 'Salvar Alterações' : 'Cadastrar');
}

// --- RESERVAS ---
function handleReserveClick(event) {
    const button = event.target.closest('.reserve-btn');
    if (!button) return;
    const quantidadeDisponivel = parseInt(button.dataset.quantidade, 10);
    if (isNaN(quantidadeDisponivel)) return Swal.fire("Erro", "Não foi possível ler a quantidade do item.", "error");

    setState({ currentRetalhoToReserve: { id: button.dataset.id, quantidadeDisponivel } });
    ui.reserveInputOs.value = '';
    
    if (quantidadeDisponivel > 1) {
        ui.reserveQuantityContainer.classList.remove('hidden');
        ui.reserveInputQuantidade.value = 1;
        ui.reserveInputQuantidade.max = quantidadeDisponivel;
        ui.reserveAvailableText.textContent = `Disponível: ${quantidadeDisponivel}`;
    } else {
        ui.reserveInputQuantidade.value = 1;
        ui.reserveQuantityContainer.classList.add('hidden');
    }
    openModal(ui.reserveModal);
}

async function handleConfirmReserve() {
    const state = getState();
    const { id, quantidadeDisponivel } = state.currentRetalhoToReserve;
    const os = ui.reserveInputOs.value.trim();
    const quantidadeReservar = parseInt(ui.reserveInputQuantidade.value, 10) || 1;
    const { currentUser } = getState();

    if (!os) return Swal.fire("Atenção", "Por favor, insira o número da OS.", "warning");
    if (quantidadeReservar <= 0 || quantidadeReservar > quantidadeDisponivel) return Swal.fire("Atenção", `A quantidade deve ser entre 1 e ${quantidadeDisponivel}.`, "warning");
    
    ui.reserveConfirmBtn.disabled = true;
    const reservaData = { retalho_id: id, numero_os: os, quantidade_reservada: quantidadeReservar };
    const retalhoUpdateData = { quantidade: quantidadeDisponivel - quantidadeReservar, reservado: true };
    
    const { error: reservaError } = await api.createReserva(reservaData);
    if (reservaError) {
        Swal.fire("Erro", "Não foi possível criar a reserva.", "error");
    } else {
        const { error: retalhoError } = await api.updateRetalho(id, retalhoUpdateData);
        if (retalhoError) {
            Swal.fire("Erro", "Reserva criada, mas falha ao atualizar o retalho.", "error");
        } else {
            const logData = {
                retalho_id: id, user_id: currentUser.id, user_email: currentUser.email,
                acao: 'RESERVA', detalhes: `Reservado para OS: ${os} | Quantidade: ${quantidadeReservar}`
            };
            await api.registrarAuditoria(logData);
            Swal.fire("Sucesso!", "Retalho reservado com sucesso.", "success");
            closeModal(ui.reserveModal);
            handleLoadRetalhos();
        }
    }
    ui.reserveConfirmBtn.disabled = false;
}

// --- HISTÓRICO, ITENS RESERVADOS E PDF ---
async function handleOpenHistoryModal(event) {
    const button = event.target.closest('.history-btn');
    if (!button) return;

    const retalhoId = button.dataset.id;
    openModal(ui.historyModal);
    ui.historyModalContent.innerHTML = '<p>Carregando histórico...</p>';

    const { data, error } = await api.fetchAuditoriaPorRetalhoId(retalhoId);

    if (error) {
        console.error("Erro ao buscar histórico:", error);
        ui.historyModalContent.innerHTML = '<p class="text-red-500">Não foi possível carregar o histórico.</p>';
        return;
    }
    dom.renderAuditoria(data);
}

const debouncedSearchReserved = debounce((term) => handleFetchReservedItems(term), 400);

function handleSearchReserved(event) {
    debouncedSearchReserved(event.target.value);
}

async function handleFetchReservedItems(searchTerm = "") {
    openModal(ui.reservedModal);
    ui.modalLoader.classList.remove('hidden');
    const { data, error } = await api.fetchAllReservations(searchTerm);
    ui.modalLoader.classList.add('hidden');
    if (error) {
        ui.reservedModalContent.innerHTML = `<p class="text-center text-red-500 p-4">Erro ao carregar reservas.</p>`;
    } else {
        dom.renderReservedItems(data);
    }
}

async function handleCancelReserve(event) {
    const button = event.target.closest('.cancel-btn');
    if (!button) return;
    const { reservaId, retalhoId, quantidadeReservada } = button.dataset;
    const { isConfirmed } = await Swal.fire({ title: "Tem certeza?", text: "Esta ação irá cancelar a reserva.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Sim, cancelar!" });
    if (isConfirmed) {
        const { currentUser } = getState();
        await api.deleteReserva(reservaId);
        const { data: retalho } = await api.fetchRetalhoById(retalhoId);
        const novaQuantidade = (retalho?.quantidade || 0) + parseInt(quantidadeReservada, 10);
        const { data: outrasReservas } = await api.fetchReservationsByRetalhoId(retalhoId);
        await api.updateRetalho(retalhoId, { quantidade: novaQuantidade, reservado: outrasReservas.length > 0 });
        
        const logData = {
            retalho_id: retalhoId, user_id: currentUser.id, user_email: currentUser.email,
            acao: 'CANCELAMENTO_RESERVA', detalhes: `Quantidade devolvida: ${quantidadeReservada}`
        };
        await api.registrarAuditoria(logData);
        
        Swal.fire("Cancelado!", "A reserva foi cancelada.", "success");
        handleFetchReservedItems(ui.osSearchInput.value);
        handleLoadRetalhos();
    }
}

function handleGeneratePdf() {
    const content = ui.reservedModalContent;
    const actionsHeader = content.querySelector('th:last-child');
    const actionsCells = content.querySelectorAll('td:last-child');

    if(actionsHeader) actionsHeader.classList.add('pdf-hidden');
    actionsCells.forEach(cell => cell.classList.add('pdf-hidden'));

    Swal.fire({ title: "Gerando PDF...", text: "Aguarde.", allowOutsideClick: false, didOpen: () => {
        Swal.showLoading();
        html2pdf().set({ margin: 10, filename: `RetalhosReservados.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: "mm", format: "a4", orientation: "landscape" } }).from(content).save().then(() => {
            Swal.close();
            if(actionsHeader) actionsHeader.classList.remove('pdf-hidden');
            actionsCells.forEach(cell => cell.classList.remove('pdf-hidden'));
        });
    }});
}

export { handleLoadRetalhos, handleFilterFormChange, handleClearFilters, handlePageChange, handleSort, handleLoadFilterOptions, handleLoadTiposParaFiltro, handleLoadEspessurasParaFiltro, handleOpenRegisterModal, handleOpenEditModal, handleMaterialCadastroChange, handleTipoCadastroChange, handleSalvarNovoMaterial, handleSalvarNovoTipo, handleClearRegisterForm, handleRegisterSubmit, handleReserveClick, handleConfirmReserve, handleOpenHistoryModal, handleSearchReserved, handleFetchReservedItems, handleCancelReserve, handleGeneratePdf };