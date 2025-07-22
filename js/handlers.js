// js/handlers.js
import * as api from './services/supabaseService.js';
import * as ui from './ui/dom.js';
import { openModal, closeModal } from './ui/modals.js';
import { getState, setState, updateFilters, resetFilters, setSort } from './state.js';
import { ITEMS_PER_PAGE, DOM_SELECTORS, REQUIRED_REGISTER_FIELDS } from './config.js';

const get = (selector) => document.querySelector(selector);

// --- HANDLERS DE CONSULTA PRINCIPAL ---

export async function handleLoadRetalhos() {
  ui.toggleLoader(true);
  const state = getState();
  const pagination = { currentPage: state.currentPage, itemsPerPage: ITEMS_PER_PAGE };
  const { data, error, count } = await api.fetchRetalhos(state.filters, pagination, state.sort);
  
  if (error) {
    console.error("Erro ao carregar retalhos:", error);
    Swal.fire("Erro", "Não foi possível carregar os retalhos.", "error");
  } else {
    ui.renderRetalhos(data || []);
    ui.updatePagination(state.currentPage, count, ITEMS_PER_PAGE);
  }
  ui.toggleLoader(false);
}

export function handleFilterFormChange() {
    const form = get(DOM_SELECTORS.filterForm);
    updateFilters(form.elements);
    ui.toggleClearButtonVisibility(form.elements);
    handleLoadRetalhos();
}

export function handleClearFilters() {
    const form = get(DOM_SELECTORS.filterForm);
    resetFilters();
    ui.resetFilterForm(form);
    handleLoadRetalhos();
    handleLoadFilterOptions(); // Recarrega os filtros
}

export function handlePageChange(direction) {
    const state = getState();
    const totalPages = Math.ceil(state.totalItems / ITEMS_PER_PAGE);
    let newPage = state.currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        setState({ currentPage: newPage });
        handleLoadRetalhos();
    }
}

export function handleSort(event) {
    const header = event.target.closest('th[data-sort]');
    if (!header) return;
    const newSortColumn = header.dataset.sort;
    setSort(newSortColumn);
    const { sort } = getState();
    ui.updateSortVisuals(sort.column, sort.direction);
    handleLoadRetalhos();
}

// --- HANDLERS DE OPÇÕES DE FILTROS ---

export async function handleLoadFilterOptions() {
    const { data: materials } = await api.fetchDistinctField('material');
    ui.populateSelect(DOM_SELECTORS.materialSelect, [...new Set(materials.map(m => m.material))].filter(Boolean), { defaultOption: 'Todos' });
    
    const state = getState();
    if(state.filters.material) {
        await handleLoadTiposParaFiltro();
    }
    if(state.filters.tipo) {
        await handleLoadEspessurasParaFiltro();
    }
}

export async function handleLoadTiposParaFiltro() {
    const material = get(DOM_SELECTORS.materialSelect).value;
    if(!material) {
        ui.populateSelect(DOM_SELECTORS.tipoSelect, [], { defaultOption: 'Todos os Tipos' });
        ui.populateSelect(DOM_SELECTORS.espessuraSelect, [], { defaultOption: 'Todas as Espessuras' });
        return;
    }
    const { data: tipos } = await api.fetchDistinctFieldWhere('tipo', { material });
    ui.populateSelect(DOM_SELECTORS.tipoSelect, [...new Set(tipos.map(t => t.tipo))].filter(Boolean), { defaultOption: 'Todos os Tipos' });
    await handleLoadEspessurasParaFiltro();
}

export async function handleLoadEspessurasParaFiltro() {
    const material = get(DOM_SELECTORS.materialSelect).value;
    const tipo = get(DOM_SELECTORS.tipoSelect).value;
    const { data: espessuras } = await api.fetchDistinctFieldWhere('espessura', { material, tipo }, false);
    const options = [...new Set(espessuras.map(e => e.espessura))].filter(Boolean);
    const formattedOptions = options.map(e => ({ value: e, text: `${e}mm`}));
    ui.populateSelect(DOM_SELECTORS.espessuraSelect, [], { defaultOption: 'Todas as Espessuras' });
    // Repopula com formato customizado
    const select = get(DOM_SELECTORS.espessuraSelect);
    formattedOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        select.appendChild(option);
    });
}

// --- HANDLERS DE RESERVA ---

export function handleReserveClick(event) {
    const button = event.target.closest('.reserve-btn');
    if (!button) return;

    setState({ 
        currentRetalhoToReserve: {
            id: button.dataset.id,
            quantidadeDisponivel: parseInt(button.dataset.quantidade),
        }
    });

    const { currentRetalhoToReserve } = getState();
    const modal = get(DOM_SELECTORS.reserveModal);
    get(DOM_SELECTORS.reserveInputOs).value = '';
    const qtyInput = get(DOM_SELECTORS.reserveInputQuantidade);
    const qtyContainer = get(DOM_SELECTORS.reserveQuantityContainer);
    
    if (currentRetalhoToReserve.quantidadeDisponivel > 1) {
        qtyContainer.classList.remove('hidden');
        qtyInput.value = 1;
        qtyInput.max = currentRetalhoToReserve.quantidadeDisponivel;
        get(DOM_SELECTORS.reserveAvailableText).textContent = `Disponível: ${currentRetalhoToReserve.quantidadeDisponivel}`;
    } else {
        qtyContainer.classList.add('hidden');
    }
    openModal(modal);
}

export async function handleConfirmReserve() {
    const state = getState();
    const { id, quantidadeDisponivel } = state.currentRetalhoToReserve;
    const os = get(DOM_SELECTORS.reserveInputOs).value.trim();
    const quantidadeReservar = parseInt(get(DOM_SELECTORS.reserveInputQuantidade).value) || 1;

    if (!os) {
      return Swal.fire("Atenção", "Por favor, insira o número da OS.", "warning");
    }
    if (quantidadeReservar <= 0 || quantidadeReservar > quantidadeDisponivel) {
      return Swal.fire("Atenção", `A quantidade deve ser entre 1 e ${quantidadeDisponivel}.`, "warning");
    }
    
    get(DOM_SELECTORS.reserveConfirmBtn).disabled = true;
    const reservaData = { retalho_id: id, numero_os: os, quantidade_reservada: quantidadeReservar };
    const retalhoUpdateData = { quantidade: quantidadeDisponivel - quantidadeReservar, reservado: true };
    
    const { error: reservaError } = await api.createReserva(reservaData);
    if (reservaError) {
        console.error("Erro ao criar reserva:", reservaError);
        Swal.fire("Erro", "Não foi possível criar a reserva.", "error");
        get(DOM_SELECTORS.reserveConfirmBtn).disabled = false;
        return;
    }

    const { error: retalhoError } = await api.updateRetalho(id, retalhoUpdateData);
    if (retalhoError) {
        console.error("Erro ao atualizar retalho:", retalhoError);
        // Tentar reverter a reserva seria o ideal aqui
        Swal.fire("Erro", "Reserva criada, mas falha ao atualizar o retalho. Contate o suporte.", "error");
    } else {
        Swal.fire("Sucesso!", "Retalho reservado com sucesso.", "success");
        closeModal(get(DOM_SELECTORS.reserveModal));
        handleLoadRetalhos();
    }
    get(DOM_SELECTORS.reserveConfirmBtn).disabled = false;
}


// --- HANDLERS DO MODAL DE RESERVADOS ---

let debounceTimer;
export function handleSearchReserved(event) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        handleFetchReservedItems(event.target.value);
    }, 300);
}

export async function handleFetchReservedItems(searchTerm = "") {
    const modal = get(DOM_SELECTORS.reservedModal);
    openModal(modal);
    get(DOM_SELECTORS.modalLoader).classList.remove('hidden');
    
    const { data, error } = await api.fetchAllReservations(searchTerm);
    get(DOM_SELECTORS.modalLoader).classList.add('hidden');

    if (error) {
        console.error("Erro ao buscar reservas:", error);
        get(DOM_SELECTORS.reservedModalContent).innerHTML = `<p class="text-center text-red-500 p-4">Erro ao carregar reservas.</p>`;
    } else {
        ui.renderReservedItems(data, get(DOM_SELECTORS.reservedModalContent));
    }
}

export async function handleCancelReserve(event) {
    const button = event.target.closest('.cancel-btn');
    if (!button) return;

    const { reservaId, retalhoId, quantidadeReservada } = button.dataset;
    const { isConfirmed } = await Swal.fire({
        title: "Tem certeza?",
        text: "Esta ação irá cancelar a reserva e devolver o retalho ao estoque.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sim, cancelar!",
        cancelButtonText: "Não",
    });

    if (isConfirmed) {
        const { error: deleteError } = await api.deleteReserva(reservaId);
        if (deleteError) return Swal.fire("Erro", "Não foi possível cancelar a reserva.", "error");

        const { data: retalho, error: fetchError } = await api.fetchRetalhoById(retalhoId);
        if(fetchError) return Swal.fire("Erro", "Não foi possível buscar o retalho original.", "error");

        const novaQuantidade = retalho.quantidade + parseInt(quantidadeReservada);
        
        const { data: outrasReservas } = await api.fetchReservationsByRetalhoId(retalhoId);
        const updateData = { 
            quantidade: novaQuantidade,
            reservado: outrasReservas.length > 0
        };

        const { error: updateError } = await api.updateRetalho(retalhoId, updateData);
        if(updateError) return Swal.fire("Erro", "Não foi possível devolver o retalho ao estoque.", "error");
        
        Swal.fire("Cancelado!", "A reserva foi cancelada.", "success");
        handleFetchReservedItems(get(DOM_SELECTORS.osSearchInput).value); // Atualiza a lista de reservados
        handleLoadRetalhos(); // Atualiza a lista principal
    }
}

export function handleGeneratePdf() {
    Swal.fire({
        title: "Gerando PDF...",
        text: "Por favor, aguarde.",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
            html2pdf().set({
                margin: 10,
                filename: `RetalhosReservados_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            }).from(get(DOM_SELECTORS.reservedModalContent)).save().then(() => {
                Swal.close();
            });
        },
    });
}

// --- HANDLERS DE CADASTRO ---
// (Simplificado, a lógica de validação completa do original pode ser adicionada aqui)
export async function handleRegisterSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = get(DOM_SELECTORS.regSubmitBtn);
    ui.toggleSubmitButton(submitBtn, true, 'Cadastrar Retalho');

    // Lógica de validação...
    
    let materialValue = form.elements['reg-material'].value;
    if (materialValue === 'novo-material') materialValue = form.elements['reg-novo-material-input'].value.trim();
    
    let tipoValue = form.elements['reg-tipo'].value;
    if (tipoValue === 'novo-tipo') tipoValue = form.elements['reg-novo-tipo-input'].value.trim();

    const novoRetalho = {
      numero: parseFloat(form.elements['reg-numero'].value),
      gaveta: form.elements['reg-gaveta'].value,
      material: materialValue,
      tipo: tipoValue,
      espessura: parseFloat(form.elements['reg-espessura'].value),
      comprimento: parseFloat(form.elements['reg-comprimento'].value),
      largura: parseFloat(form.elements['reg-largura'].value),
      quantidade: parseFloat(form.elements['reg-quantidade'].value),
      obs: form.elements['reg-obs'].value || null,
      reservado: false,
    };

    const { data: existing, error: checkError } = await api.checkForExistingRetalho(novoRetalho);
    if (checkError && checkError.code !== 'PGRST116') { // Ignora erro de 'nenhum resultado'
        Swal.fire('Erro', 'Falha ao verificar duplicidade.', 'error');
        ui.toggleSubmitButton(submitBtn, false, 'Cadastrar Retalho');
        return;
    }
    
    if (existing) {
        // Lógica de Retalho Duplicado...
        const { isConfirmed } = await Swal.fire({
            icon: "warning",
            title: "Retalho Duplicado Encontrado!",
            html: `Já existe um retalho com essas características (Nº ${existing.numero}).<br>Deseja somar a quantidade digitada (${novoRetalho.quantidade})?`,
            showCancelButton: true,
            confirmButtonText: "Sim, somar",
        });
        if(isConfirmed) {
            const novaQuantidade = existing.quantidade + novoRetalho.quantidade;
            const { error } = await api.updateRetalho(existing.id, { quantidade: novaQuantidade });
            if(error) Swal.fire('Erro', 'Falha ao atualizar quantidade.', 'error');
            else Swal.fire('Sucesso!', `Quantidade atualizada para ${novaQuantidade}.`, 'success');
        }
    } else {
        // Criar novo retalho
        const { error } = await api.createRetalho(novoRetalho);
        if(error) Swal.fire('Erro', 'Falha ao cadastrar retalho.', 'error');
        else Swal.fire('Sucesso!', 'Retalho cadastrado.', 'success');
    }
    
    closeModal(get(DOM_SELECTORS.registerModal));
    ui.resetRegisterForm(form);
    handleLoadRetalhos();
    handleLoadFilterOptions();
    ui.toggleSubmitButton(submitBtn, false, 'Cadastrar Retalho');
}