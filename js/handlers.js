import * as api from './services/api.js';
import * as dom from './ui/dom.js';
import { ui } from './uiElements.js';
import { openModal, closeModal } from './ui/modals.js';
import { getState, setState, updateFilters, resetFilters, setSort } from './state.js';
import { ITEMS_PER_PAGE } from './config.js';

// --- HANDLERS DA CONSULTA PRINCIPAL (sem alterações) ---
async function handleLoadRetalhos() {
  dom.toggleLoader(true);
  const state = getState();
  const pagination = { currentPage: state.currentPage, itemsPerPage: ITEMS_PER_PAGE };
  const { data, error, count } = await api.fetchRetalhos(state.filters, pagination, state.sort);
  
  if (error) {
    console.error("Erro ao carregar retalhos:", error);
    Swal.fire("Erro", "Não foi possível carregar os retalhos.", "error");
  } else {
    dom.renderRetalhos(data || []);
    dom.updatePagination(state.currentPage, count, ITEMS_PER_PAGE);
  }
  dom.toggleLoader(false);
}

function handleFilterFormChange() {
    updateFilters();
    dom.toggleClearButtonVisibility();
    handleLoadRetalhos();
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
        const options = [...new Set(espessuras.map(e => e.espessura))].filter(Boolean);
        const formattedOptions = options.map(e => ({ value: e, text: `${e}mm`}));
        dom.populateSelect(ui.espessuraSelect, formattedOptions, { defaultOption: 'Todas as Espessuras', valueKey: 'value', textKey: 'text' });
    }
}


// --- HANDLERS DO MODAL DE CADASTRO (COM CORREÇÕES E NOVAS FUNÇÕES) ---

async function handleOpenRegisterModal() {
    dom.resetRegisterForm();
    const { data } = await api.fetchDistinctField('material');
    if (data) {
        const materialNames = [...new Set(data.map(m => m.material))].filter(Boolean);
        setState({ existingMaterials: materialNames.map(m => m.toLowerCase()) });
        dom.populateSelect(ui.regMaterialSelect, materialNames, { defaultOption: 'Selecione...', addOptions: [`<option value="novo-material">-- Novo Material --</option>`] });
    }
    dom.populateSelect(ui.regTipoSelect, [], { defaultOption: 'Selecione um material...', addOptions: [`<option value="novo-tipo">-- Novo Tipo --</option>`] });
    openModal(ui.registerModal);
}

async function handleMaterialCadastroChange() {
    const selectedMaterial = ui.regMaterialSelect.value;
    ui.regNovoMaterialContainer.classList.add('hidden');
    ui.regNovoTipoContainer.classList.add('hidden');

    if (selectedMaterial === 'novo-material') {
        ui.regNovoMaterialContainer.classList.remove('hidden');
        ui.regNovoMaterialInput.focus();
        dom.populateSelect(ui.regTipoSelect, [], { defaultOption: 'Salve o novo material primeiro', addOptions: [] });
    } else if (selectedMaterial) {
        const { data } = await api.fetchDistinctFieldWhere('tipo', { material: selectedMaterial });
        if (data) {
            const tipoNames = [...new Set(data.map(t => t.tipo))].filter(Boolean);
            setState({ existingTypes: tipoNames.map(t => t.toLowerCase()) });
            dom.populateSelect(ui.regTipoSelect, tipoNames, { defaultOption: 'Selecione...', addOptions: [`<option value="novo-tipo">-- Novo Tipo --</option>`] });
        }
    } else {
        dom.populateSelect(ui.regTipoSelect, [], { defaultOption: 'Selecione um material...', addOptions: [`<option value="novo-tipo">-- Novo Tipo --</option>`] });
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
    
    // Insere antes da última opção ("-- Novo ... --")
    const lastOption = selectElement.querySelector('option[value^="novo-"]');
    selectElement.insertBefore(newOption, lastOption);
    selectElement.value = value;
}

function handleSalvarNovoMaterial() {
    const novoMaterial = ui.regNovoMaterialInput.value.trim();
    const { existingMaterials } = getState();

    if (!novoMaterial) return Swal.fire("Atenção", "Por favor, insira o nome do novo material.", "warning");
    if (existingMaterials.includes(novoMaterial.toLowerCase())) return Swal.fire("Atenção", "Este material já está cadastrado.", "warning");

    addAndSelectOption(ui.regMaterialSelect, novoMaterial);
    existingMaterials.push(novoMaterial.toLowerCase());
    ui.regNovoMaterialContainer.classList.add('hidden');
    ui.regNovoMaterialInput.value = '';
    handleMaterialCadastroChange(); // Atualiza a lista de tipos
}

function handleSalvarNovoTipo() {
    const novoTipo = ui.regNovoTipoInput.value.trim();
    const { existingTypes } = getState();

    if (!novoTipo) return Swal.fire("Atenção", "Por favor, insira o nome do novo tipo.", "warning");
    if (existingTypes.includes(novoTipo.toLowerCase())) return Swal.fire("Atenção", "Este tipo já está cadastrado para este material.", "warning");

    addAndSelectOption(ui.regTipoSelect, novoTipo);
    existingTypes.push(novoTipo.toLowerCase());
    ui.regNovoTipoContainer.classList.add('hidden');
    ui.regNovoTipoInput.value = '';
}

function handleClearRegisterForm() {
    dom.resetRegisterForm(ui.registerForm);
}

// --- HANDLERS DE RESERVA (sem alterações) ---
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
            Swal.fire("Erro", "Reserva criada, mas falha ao atualizar o retalho. Contate o suporte.", "error");
        } else {
            Swal.fire("Sucesso!", "Retalho reservado com sucesso.", "success");
            closeModal(ui.reserveModal);
            handleLoadRetalhos();
        }
    }
    ui.reserveConfirmBtn.disabled = false;
}

// --- OUTROS HANDLERS (sem alterações) ---
let debounceTimer;
function handleSearchReserved(event) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { handleFetchReservedItems(event.target.value); }, 300);
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
    const { isConfirmed } = await Swal.fire({ title: "Tem certeza?", text: "Esta ação irá cancelar a reserva e devolver o retalho ao estoque.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Sim, cancelar!" });
    if (isConfirmed) {
        const { error: deleteError } = await api.deleteReserva(reservaId);
        if (deleteError) return Swal.fire("Erro", "Não foi possível cancelar a reserva.", "error");
        const { data: retalho } = await api.fetchRetalhoById(retalhoId);
        const novaQuantidade = (retalho?.quantidade || 0) + parseInt(quantidadeReservada, 10);
        const { data: outrasReservas } = await api.fetchReservationsByRetalhoId(retalhoId);
        await api.updateRetalho(retalhoId, { quantidade: novaQuantidade, reservado: outrasReservas.length > 0 });
        Swal.fire("Cancelado!", "A reserva foi cancelada.", "success");
        handleFetchReservedItems(ui.osSearchInput.value);
        handleLoadRetalhos();
    }
}

function handleGeneratePdf() {
    Swal.fire({ title: "Gerando PDF...", text: "Por favor, aguarde.", allowOutsideClick: false, didOpen: () => {
        Swal.showLoading();
        html2pdf().set({ margin: 10, filename: `RetalhosReservados_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(ui.reservedModalContent).save().then(() => Swal.close());
    }});
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = ui.regSubmitBtn;
    dom.toggleSubmitButton(submitBtn, true, 'Cadastrar Retalho');
    
    let materialValue = form.elements['reg-material'].value;
    if (materialValue === 'novo-material') materialValue = form.elements['reg-novo-material-input'].value.trim();
    let tipoValue = form.elements['reg-tipo'].value;
    if (tipoValue === 'novo-tipo') tipoValue = form.elements['reg-novo-tipo-input'].value.trim();

    const novoRetalho = {
      numero: parseFloat(form.elements['reg-numero'].value), gaveta: form.elements['reg-gaveta'].value,
      material: materialValue, tipo: tipoValue, espessura: parseFloat(form.elements['reg-espessura'].value),
      comprimento: parseFloat(form.elements['reg-comprimento'].value), largura: parseFloat(form.elements['reg-largura'].value),
      quantidade: parseInt(form.elements['reg-quantidade'].value, 10), obs: form.elements['reg-obs'].value || null, reservado: false,
    };

    const { data: existing, error: checkError } = await api.checkForExistingRetalho(novoRetalho);
    if (checkError) {
        Swal.fire('Erro', 'Falha ao verificar duplicidade.', 'error');
    } else if (existing) {
        const { isConfirmed } = await Swal.fire({ icon: "warning", title: "Retalho Duplicado Encontrado!", html: `Já existe um retalho com essas características (Nº ${existing.numero}).<br>Deseja somar a quantidade digitada (${novoRetalho.quantidade})?`, showCancelButton: true, confirmButtonText: "Sim, somar"});
        if(isConfirmed) {
            const novaQuantidade = existing.quantidade + novoRetalho.quantidade;
            const { error } = await api.updateRetalho(existing.id, { quantidade: novaQuantidade });
            if(error) Swal.fire('Erro', 'Falha ao atualizar quantidade.', 'error');
            else Swal.fire('Sucesso!', `Quantidade atualizada para ${novaQuantidade}.`, 'success');
        }
    } else {
        const { error } = await api.createRetalho(novoRetalho);
        if(error) Swal.fire('Erro', 'Falha ao cadastrar retalho.', 'error');
        else Swal.fire('Sucesso!', 'Retalho cadastrado.', 'success');
    }
    
    closeModal(ui.registerModal);
    dom.resetRegisterForm(form);
    handleLoadRetalhos();
    handleLoadFilterOptions();
    dom.toggleSubmitButton(submitBtn, false, 'Cadastrar Retalho');
}

export { handleLoadRetalhos, handleFilterFormChange, handleClearFilters, handlePageChange, handleSort, handleLoadFilterOptions, handleLoadTiposParaFiltro, handleLoadEspessurasParaFiltro, handleOpenRegisterModal, handleMaterialCadastroChange, handleTipoCadastroChange, handleSalvarNovoMaterial, handleSalvarNovoTipo, handleClearRegisterForm, handleReserveClick, handleConfirmReserve, handleSearchReserved, handleFetchReservedItems, handleCancelReserve, handleGeneratePdf, handleRegisterSubmit };