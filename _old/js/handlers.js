import * as api from "./services/api.js";
import * as dom from "./ui/dom.js";
import { SELECTORS } from "./selectors.js";
import { openModal, closeModal } from "./ui/modals.js";
import {
  getState,
  setState,
  updateFilters,
  resetFilters,
  setSort,
} from "./state.js";
import { ITEMS_PER_PAGE } from "./config.js";
import { debounce } from "./utils.js";

const get = (selector) => document.querySelector(selector);
let currentRetalhoToEdit = null;

async function handleDeleteRetalho(event) {
  const button = event.target.closest(".delete-btn");
  if (!button) return;
  const { id: retalhoId, numero: retalhoNumero } = button.dataset;
  const { isConfirmed } = await Swal.fire({
    title: `Tem certeza que deseja excluir o Retalho Nº ${retalhoNumero}?`,
    text: "Esta ação é irreversível e removerá o item permanentemente do estoque.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sim, excluir!",
    cancelButtonText: "Cancelar",
  });
  if (isConfirmed) {
    const { error } = await api.deleteRetalho(retalhoId);
    if (error) {
      console.error("Erro ao excluir retalho:", error);
      return Swal.fire("Erro!", "Não foi possível excluir o retalho.", "error");
    }
    const { currentUser } = getState();
    await api.registrarAuditoria({
      retalho_id: retalhoId,
      user_id: currentUser.id,
      user_email: currentUser.email,
      acao: "EXCLUSAO_MANUAL",
      detalhes: `Retalho Nº ${retalhoNumero} excluído permanentemente.`,
    });
    await Swal.fire(
      "Excluído!",
      "O retalho foi removido com sucesso.",
      "success",
    );
    handleLoadRetalhos();
  }
}

async function handleBaixaRetalho(event) {
  const button = event.target.closest(".baixa-btn");
  if (!button) return;
  const { reservaId, retalhoId, os, numero } = button.dataset;
  const { isConfirmed } = await Swal.fire({
    title: "Confirmar Baixa de Retalho?",
    html: `Confirma o uso do Retalho Nº <strong>${numero}</strong> na OS <strong>${os}</strong>?<br/><br/>A reserva e o retalho serão removidos permanentemente.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim, confirmar uso!",
    cancelButtonText: "Cancelar",
  });
  if (isConfirmed) {
    const { error: reservaError } = await api.deleteReserva(reservaId);
    if (reservaError) {
      console.error("Erro ao deletar reserva na baixa:", reservaError);
      return Swal.fire("Erro!", "Não foi possível remover a reserva.", "error");
    }
    const { error: retalhoError } = await api.deleteRetalho(retalhoId);
    if (retalhoError) {
      console.error("Erro ao deletar retalho na baixa:", retalhoError);
      return Swal.fire(
        "Erro!",
        "Reserva removida, mas falha ao dar baixa no retalho.",
        "error",
      );
    }
    const { currentUser } = getState();
    await api.registrarAuditoria({
      retalho_id: retalhoId,
      user_id: currentUser.id,
      user_email: currentUser.email,
      acao: "BAIXA_POR_USO",
      detalhes: `Baixa do Retalho Nº ${numero} para uso na OS: ${os}.`,
    });
    await Swal.fire(
      "Sucesso!",
      "Baixa do retalho realizada com sucesso.",
      "success",
    );
    handleFetchReservedItems(get(SELECTORS.osSearchInput).value);
    handleLoadRetalhos();
  }
}

function parseSearchQuery(query) {
  const normalizedQuery = query.toLowerCase().replace(/,/g, ".");
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const filters = {};
  const dimensionRegex = /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)/;
  const dimensionMatch = normalizedQuery.match(dimensionRegex);
  if (dimensionMatch) {
    const measure1 = parseFloat(dimensionMatch[1]);
    const measure2 = parseFloat(dimensionMatch[2]);
    filters.comprimento = Math.max(measure1, measure2);
    filters.largura = Math.min(measure1, measure2);
  }
  const thicknessRegex = /(\d*\.?\d+)mm/;
  const thicknessMatch = normalizedQuery.match(thicknessRegex);
  if (thicknessMatch) {
    filters.espessura = parseFloat(thicknessMatch[1]);
  }
  const textTerms = terms.filter(
    (term) => !term.match(dimensionRegex) && !term.match(thicknessRegex),
  );
  if (textTerms.length > 0) {
    filters.textSearch = textTerms;
  }
  return filters;
}

function handleSmartSearch() {
  const query = get(SELECTORS.smartSearchInput).value;
  const parsedFilters = parseSearchQuery(query);
  get(SELECTORS.filterForm).reset();
  if (parsedFilters.largura)
    get(SELECTORS.larguraInput).value = parsedFilters.largura;
  if (parsedFilters.comprimento)
    get(SELECTORS.alturaInput).value = parsedFilters.comprimento;
  setState({ filters: parsedFilters, currentPage: 1 });
  handleLoadRetalhos();
  dom.toggleClearButtonVisibility();
}

export const debouncedSmartSearch = debounce(handleSmartSearch, 500);

function validateRegisterForm() {
  const form = get(SELECTORS.registerForm);
  const requiredFields = [
    form.elements["reg-numero"],
    form.elements["reg-gaveta"],
    form.elements["reg-material"],
    form.elements["reg-tipo"],
    form.elements["reg-espessura"],
    form.elements["reg-comprimento"],
    form.elements["reg-largura"],
    form.elements["reg-quantidade"],
  ];
  let isValid = true;
  for (const field of requiredFields) {
    field.classList.remove("border-red-500");
    if (!field.value) {
      field.classList.add("border-red-500");
      isValid = false;
    }
  }
  if (!isValid) {
    Swal.fire(
      "Atenção",
      "Por favor, preencha todos os campos obrigatórios.",
      "warning",
    );
  }
  return isValid;
}

async function handleLoadRetalhos() {
  dom.toggleLoader(true);
  const state = getState();
  const pagination = {
    currentPage: state.currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
  };
  const { data, error, count } = await api.fetchRetalhos(
    state.filters,
    pagination,
    state.sort,
  );
  if (error) {
    console.error("Erro ao carregar retalhos:", error);
    Swal.fire("Erro", "Não foi possível carregar os retalhos.", "error");
  } else {
    setState({ totalItems: count });
    dom.renderRetalhos(data || []);
    dom.updatePagination(state.currentPage, count, ITEMS_PER_PAGE);
  }
  dom.toggleLoader(false);
}

function handleFilterFormChange() {
  get(SELECTORS.smartSearchInput).value = "";
  updateFilters(get(SELECTORS.filterForm));
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
  const header = event.target.closest("th[data-sort]");
  if (!header) return;
  const newSortColumn = header.dataset.sort;
  setSort(newSortColumn);
  const { sort } = getState();
  dom.updateSortVisuals(sort.column, sort.direction);
  handleLoadRetalhos();
}

async function handleLoadFilterOptions() {
  const { data: materials } = await api.fetchDistinctField("material");
  if (materials) {
    dom.populateSelect(
      get(SELECTORS.materialSelect),
      [...new Set(materials.map((m) => m.material))].filter(Boolean),
      { defaultOption: "Todos" },
    );
  }
  const state = getState();
  if (state.filters.material) await handleLoadTiposParaFiltro();
  if (state.filters.tipo) await handleLoadEspessurasParaFiltro();
}

async function handleLoadTiposParaFiltro() {
  const material = get(SELECTORS.materialSelect).value;
  dom.populateSelect(get(SELECTORS.espessuraSelect), [], {
    defaultOption: "Todas as Espessuras",
  });
  if (!material) {
    dom.populateSelect(get(SELECTORS.tipoSelect), [], {
      defaultOption: "Todos os Tipos",
    });
    return;
  }
  const { data: tipos } = await api.fetchDistinctFieldWhere("tipo", {
    material,
  });
  if (tipos) {
    dom.populateSelect(
      get(SELECTORS.tipoSelect),
      [...new Set(tipos.map((t) => t.tipo))].filter(Boolean),
      { defaultOption: "Todos os Tipos" },
    );
  }
  await handleLoadEspessurasParaFiltro();
}

async function handleLoadEspessurasParaFiltro() {
  const material = get(SELECTORS.materialSelect).value;
  const tipo = get(SELECTORS.tipoSelect).value;
  const { data: espessuras } = await api.fetchDistinctFieldWhere(
    "espessura",
    { material, tipo },
    false,
  );
  if (espessuras) {
    const options = [...new Set(espessuras.map((e) => e.espessura))]
      .filter(Boolean)
      .sort((a, b) => a - b);
    const formattedOptions = options.map((e) => ({ value: e, text: `${e}mm` }));
    dom.populateSelect(get(SELECTORS.espessuraSelect), formattedOptions, {
      defaultOption: "Todas as Espessuras",
      valueKey: "value",
      textKey: "text",
    });
  }
}

async function setupRegisterModal(mode = "add", retalhoData = null) {
  dom.resetRegisterForm();
  currentRetalhoToEdit = retalhoData;
  const form = get(SELECTORS.registerForm);
  const isEditMode = mode === "edit";
  get(SELECTORS.registerModalTitle).textContent = isEditMode
    ? "Editar Retalho"
    : "Cadastrar Novo Retalho";
  get(SELECTORS.regSubmitBtnText).textContent = isEditMode
    ? "Salvar Alterações"
    : "Cadastrar";
  get(SELECTORS.editRetalhoId).value = isEditMode ? retalhoData.id : "";
  const { data } = await api.fetchDistinctField("material");
  const materialNames = data
    ? [...new Set(data.map((m) => m.material))].filter(Boolean)
    : [];
  setState({ existingMaterials: materialNames.map((m) => m.toLowerCase()) });
  dom.populateSelect(form.elements["reg-material"], materialNames, {
    defaultOption: "Selecione...",
    addOptions: [`<option value="novo-material">-- Novo Material --</option>`],
  });
  if (isEditMode) {
    form.elements["reg-numero"].value = retalhoData.numero;
    form.elements["reg-gaveta"].value = retalhoData.gaveta;
    form.elements["reg-quantidade"].value = retalhoData.quantidade;
    form.elements["reg-material"].value = retalhoData.material;
    await handleMaterialCadastroChange();
    form.elements["reg-tipo"].value = retalhoData.tipo;
    form.elements["reg-espessura"].value = retalhoData.espessura;
    form.elements["reg-comprimento"].value = retalhoData.comprimento;
    form.elements["reg-largura"].value = retalhoData.largura;
    form.elements["reg-obs"].value = retalhoData.obs || "";
  } else {
    dom.populateSelect(form.elements["reg-tipo"], [], {
      defaultOption: "Selecione um material...",
      addOptions: [`<option value="novo-tipo">-- Novo Tipo --</option>`],
    });
  }
  openModal(get(SELECTORS.registerModal));
}

async function handleOpenRegisterModal() {
  await setupRegisterModal("add");
}
async function handleOpenEditModal(event) {
  const button = event.target.closest(".edit-btn");
  if (!button) return;
  const retalhoId = button.dataset.id;
  const { data, error } = await api.fetchFullRetalhoById(retalhoId);
  if (error) {
    return Swal.fire(
      "Erro",
      "Não foi possível carregar os dados para edição.",
      "error",
    );
  }
  await setupRegisterModal("edit", data);
}

async function handleMaterialCadastroChange() {
  const form = get(SELECTORS.registerForm);
  const selectedMaterial = form.elements["reg-material"].value;
  get(SELECTORS.regNovoMaterialContainer).classList.add("hidden");
  get(SELECTORS.regNovoTipoContainer).classList.add("hidden");
  if (selectedMaterial === "novo-material") {
    get(SELECTORS.regNovoMaterialContainer).classList.remove("hidden");
    get(SELECTORS.regNovoMaterialInput).focus();
    dom.populateSelect(form.elements["reg-tipo"], [], {
      defaultOption: "Salve o novo material",
    });
  } else if (selectedMaterial) {
    const { data } = await api.fetchDistinctFieldWhere("tipo", {
      material: selectedMaterial,
    });
    const tipoNames = data
      ? [...new Set(data.map((t) => t.tipo))].filter(Boolean)
      : [];
    setState({ existingTypes: tipoNames.map((t) => t.toLowerCase()) });
    dom.populateSelect(form.elements["reg-tipo"], tipoNames, {
      defaultOption: "Selecione...",
      addOptions: [`<option value="novo-tipo">-- Novo Tipo --</option>`],
    });
  } else {
    dom.populateSelect(form.elements["reg-tipo"], [], {
      defaultOption: "Selecione um material...",
    });
  }
}

function handleTipoCadastroChange() {
  const form = get(SELECTORS.registerForm);
  if (form.elements["reg-tipo"].value === "novo-tipo") {
    get(SELECTORS.regNovoTipoContainer).classList.remove("hidden");
    get(SELECTORS.regNovoTipoInput).focus();
  } else {
    get(SELECTORS.regNovoTipoContainer).classList.add("hidden");
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
  const novoMaterial = get(SELECTORS.regNovoMaterialInput).value.trim();
  if (!novoMaterial)
    return Swal.fire(
      "Atenção",
      "O nome do novo material não pode ser vazio.",
      "warning",
    );
  const { existingMaterials } = getState();
  if (existingMaterials.includes(novoMaterial.toLowerCase()))
    return Swal.fire("Atenção", "Este material já existe.", "warning");
  addAndSelectOption(
    get(SELECTORS.registerForm).elements["reg-material"],
    novoMaterial,
  );
  existingMaterials.push(novoMaterial.toLowerCase());
  get(SELECTORS.regNovoMaterialContainer).classList.add("hidden");
  get(SELECTORS.regNovoMaterialInput).value = "";
  handleMaterialCadastroChange();
}

function handleSalvarNovoTipo() {
  const novoTipo = get(SELECTORS.regNovoTipoInput).value.trim();
  if (!novoTipo)
    return Swal.fire(
      "Atenção",
      "O nome do novo tipo não pode ser vazio.",
      "warning",
    );
  const { existingTypes } = getState();
  if (existingTypes.includes(novoTipo.toLowerCase()))
    return Swal.fire(
      "Atenção",
      "Este tipo já existe para este material.",
      "warning",
    );
  addAndSelectOption(
    get(SELECTORS.registerForm).elements["reg-tipo"],
    novoTipo,
  );
  existingTypes.push(novoTipo.toLowerCase());
  get(SELECTORS.regNovoTipoContainer).classList.add("hidden");
  get(SELECTORS.regNovoTipoInput).value = "";
}

function handleClearRegisterForm() {
  const isEditMode = !!get(SELECTORS.editRetalhoId).value;
  if (isEditMode && currentRetalhoToEdit) {
    setupRegisterModal("edit", currentRetalhoToEdit);
  } else {
    dom.resetRegisterForm();
    handleMaterialCadastroChange();
  }
}

async function handleRegisterSubmit() {
  if (!validateRegisterForm()) return;
  const form = get(SELECTORS.registerForm);
  const submitBtn = get(SELECTORS.regSubmitBtn);
  const isEditMode = !!form.elements["edit-retalho-id"].value;
  const { currentUser } = getState();
  let materialValue = form.elements["reg-material"].value;
  if (materialValue === "novo-material")
    materialValue = get(SELECTORS.regNovoMaterialInput).value.trim();
  let tipoValue = form.elements["reg-tipo"].value;
  if (tipoValue === "novo-tipo")
    tipoValue = get(SELECTORS.regNovoTipoInput).value.trim();
  const retalhoData = {
    numero: parseFloat(form.elements["reg-numero"].value),
    gaveta: form.elements["reg-gaveta"].value,
    material: materialValue,
    tipo: tipoValue,
    espessura: parseFloat(form.elements["reg-espessura"].value),
    comprimento: parseFloat(form.elements["reg-comprimento"].value),
    largura: parseFloat(form.elements["reg-largura"].value),
    quantidade: parseInt(form.elements["reg-quantidade"].value, 10),
    obs: form.elements["reg-obs"].value || null,
  };
  dom.toggleSubmitButton(
    submitBtn,
    true,
    isEditMode ? "Salvando..." : "Verificando...",
  );
  if (!isEditMode) {
    const existingRetalho = await api.checkForExistingRetalho(retalhoData);
    if (existingRetalho) {
      dom.toggleSubmitButton(submitBtn, false, "Cadastrar");
      const { isConfirmed } = await Swal.fire({
        title: "Retalho Duplicado Encontrado!",
        html: `Já existe um retalho (Nº: <strong>${existingRetalho.numero}</strong>) com estas mesmas características.<br><br>Deseja somar a quantidade <strong>(${retalhoData.quantidade})</strong> ao estoque existente?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, somar!",
        cancelButtonText: "Não, cancelar",
      });
      if (isConfirmed) {
        dom.toggleSubmitButton(submitBtn, true, "Atualizando...");
        const newQuantity = existingRetalho.quantidade + retalhoData.quantidade;
        const { error: updateError } = await api.updateRetalho(
          existingRetalho.id,
          { quantidade: newQuantity },
        );
        if (updateError) {
          Swal.fire(
            "Erro!",
            "Não foi possível atualizar a quantidade.",
            "error",
          );
        } else {
          await api.registrarAuditoria({
            retalho_id: existingRetalho.id,
            user_id: currentUser.id,
            user_email: currentUser.email,
            acao: "SOMA_DE_ESTOQUE",
            detalhes: `Adicionado ${retalhoData.quantidade}. Estoque anterior: ${existingRetalho.quantidade}, Estoque novo: ${newQuantity}.`,
          });
          Swal.fire(
            "Sucesso!",
            "A quantidade foi somada ao retalho existente.",
            "success",
          );
          closeModal(get(SELECTORS.registerModal));
          handleLoadRetalhos();
        }
        dom.toggleSubmitButton(submitBtn, false, "Cadastrar");
      }
      return;
    }
  }
  let result;
  if (isEditMode) {
    const id = form.elements["edit-retalho-id"].value;
    result = await api.updateRetalho(id, retalhoData);
    result.data = { id };
  } else {
    result = await api.createRetalho({ ...retalhoData, reservado: false });
  }
  if (result.error) {
    console.error(
      `Erro ao ${isEditMode ? "editar" : "cadastrar"} retalho:`,
      result.error,
    );
    Swal.fire(
      "Erro",
      `Não foi possível ${isEditMode ? "salvar as alterações" : "cadastrar o retalho"}.`,
      "error",
    );
  } else {
    await api.registrarAuditoria({
      retalho_id: result.data.id,
      user_id: currentUser.id,
      user_email: currentUser.email,
      acao: isEditMode ? "EDICAO" : "CRIACAO",
      detalhes: isEditMode ? "Retalho editado." : "Novo retalho cadastrado.",
    });
    Swal.fire(
      "Sucesso!",
      `Retalho ${isEditMode ? "atualizado" : "cadastrado"} com sucesso!`,
      "success",
    );
    closeModal(get(SELECTORS.registerModal));
    handleLoadRetalhos();
    handleLoadFilterOptions();
  }
  dom.toggleSubmitButton(
    submitBtn,
    false,
    isEditMode ? "Salvar Alterações" : "Cadastrar",
  );
}

function handleReserveClick(event) {
  const button = event.target.closest(".reserve-btn");
  if (!button) return;
  const quantidadeDisponivel = parseInt(button.dataset.quantidade, 10);
  if (isNaN(quantidadeDisponivel))
    return Swal.fire("Erro", "Não foi possível ler a quantidade.", "error");
  setState({
    currentRetalhoToReserve: { id: button.dataset.id, quantidadeDisponivel },
  });
  get(SELECTORS.reserveInputOs).value = "";
  if (quantidadeDisponivel > 1) {
    get(SELECTORS.reserveQuantityContainer).classList.remove("hidden");
    get(SELECTORS.reserveInputQuantidade).value = 1;
    get(SELECTORS.reserveInputQuantidade).max = quantidadeDisponivel;
    get(SELECTORS.reserveAvailableText).textContent =
      `Disponível: ${quantidadeDisponivel}`;
  } else {
    get(SELECTORS.reserveInputQuantidade).value = 1;
    get(SELECTORS.reserveQuantityContainer).classList.add("hidden");
  }
  openModal(get(SELECTORS.reserveModal));
}

async function handleConfirmReserve() {
  const state = getState();
  const { id, quantidadeDisponivel } = state.currentRetalhoToReserve;
  const os = get(SELECTORS.reserveInputOs).value.trim();
  const quantidadeReservar =
    parseInt(get(SELECTORS.reserveInputQuantidade).value, 10) || 1;
  const { currentUser } = getState();
  if (!os)
    return Swal.fire("Atenção", "Por favor, insira o número da OS.", "warning");
  if (quantidadeReservar <= 0 || quantidadeReservar > quantidadeDisponivel)
    return Swal.fire(
      "Atenção",
      `A quantidade deve ser entre 1 e ${quantidadeDisponivel}.`,
      "warning",
    );
  get(SELECTORS.reserveConfirmBtn).disabled = true;
  const reservaData = {
    retalho_id: id,
    numero_os: os,
    quantidade_reservada: quantidadeReservar,
    user_id: currentUser.id,
  };
  const retalhoUpdateData = {
    quantidade: quantidadeDisponivel - quantidadeReservar,
    reservado: true,
  };
  const { error: reservaError } = await api.createReserva(reservaData);
  if (reservaError) {
    Swal.fire("Erro", "Não foi possível criar a reserva.", "error");
  } else {
    const { error: retalhoError } = await api.updateRetalho(
      id,
      retalhoUpdateData,
    );
    if (retalhoError) {
      Swal.fire(
        "Erro",
        "Reserva criada, mas falha ao atualizar o retalho.",
        "error",
      );
    } else {
      const logData = {
        retalho_id: id,
        user_id: currentUser.id,
        user_email: currentUser.email,
        acao: "RESERVA",
        detalhes: `Reservado para OS: ${os} | Quantidade: ${quantidadeReservar}`,
      };
      await api.registrarAuditoria(logData);
      Swal.fire("Sucesso!", "Retalho reservado com sucesso.", "success");
      closeModal(get(SELECTORS.reserveModal));
      handleLoadRetalhos();
    }
  }
  get(SELECTORS.reserveConfirmBtn).disabled = false;
}

async function handleOpenHistoryModal(event) {
  const button = event.target.closest(".history-btn");
  if (!button) return;
  const retalhoId = button.dataset.id;
  openModal(get(SELECTORS.historyModal));
  get(SELECTORS.historyModalContent).innerHTML =
    "<p>Carregando histórico...</p>";
  const { data, error } = await api.fetchAuditoriaPorRetalhoId(retalhoId);
  if (error) {
    console.error("Erro ao buscar histórico:", error);
    get(SELECTORS.historyModalContent).innerHTML =
      '<p class="text-red-500">Não foi possível carregar o histórico.</p>';
    return;
  }
  dom.renderAuditoria(data);
}

const debouncedSearchReserved = debounce(
  (term) => handleFetchReservedItems(term),
  400,
);

function handleSearchReserved(event) {
  debouncedSearchReserved(event.target.value);
}

async function handleFetchReservedItems(searchTerm = "") {
  openModal(get(SELECTORS.reservedModal));
  get(SELECTORS.modalLoader).classList.remove("hidden");
  const { data, error } = await api.fetchAllReservations(searchTerm);
  get(SELECTORS.modalLoader).classList.add("hidden");
  if (error) {
    get(SELECTORS.reservedModalContent).innerHTML =
      `<p class="text-center text-red-500 p-4">Erro ao carregar reservas.</p>`;
  } else {
    dom.renderReservedItems(data);
  }
}

async function handleCancelReserve(event) {
  const button = event.target.closest(".cancel-btn");
  if (!button) return;
  const { reservaId, retalhoId, quantidadeReservada } = button.dataset;
  const { isConfirmed } = await Swal.fire({
    title: "Tem certeza?",
    text: "Esta ação irá cancelar a reserva e retornar o item ao estoque.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonText: "Não",
    confirmButtonText: "Sim, cancelar!",
  });
  if (isConfirmed) {
    const { error: deleteError } = await api.deleteReserva(reservaId);
    if (deleteError) {
      console.error("Erro ao deletar reserva (RLS?):", deleteError);
      Swal.fire(
        "Erro!",
        "Não foi possível cancelar a reserva. Verifique suas permissões (RLS).",
        "error",
      );
      return;
    }
    const { data: retalho } = await api.fetchRetalhoById(retalhoId);
    const novaQuantidade =
      (retalho?.quantidade || 0) + parseInt(quantidadeReservada, 10);
    const { data: outrasReservas } =
      await api.fetchReservationsByRetalhoId(retalhoId);
    await api.updateRetalho(retalhoId, {
      quantidade: novaQuantidade,
      reservado: outrasReservas.length > 0,
    });
    const { currentUser } = getState();
    await api.registrarAuditoria({
      retalho_id: retalhoId,
      user_id: currentUser.id,
      user_email: currentUser.email,
      acao: "CANCELAMENTO_RESERVA",
      detalhes: `Quantidade devolvida ao estoque: ${quantidadeReservada}`,
    });
    await Swal.fire(
      "Cancelado!",
      "A reserva foi cancelada com sucesso.",
      "success",
    );
    handleFetchReservedItems(get(SELECTORS.osSearchInput).value);
    handleLoadRetalhos();
  }
}

function handleGeneratePdf() {
  const content = get(SELECTORS.reservedModalContent);
  const actionsHeader = content.querySelector(".actions-cell-pdf");
  const actionsCells = content.querySelectorAll(".actions-cell-pdf");
  if (actionsHeader) actionsHeader.classList.add("pdf-hidden");
  actionsCells.forEach((cell) => cell.classList.add("pdf-hidden"));
  Swal.fire({
    title: "Gerando PDF...",
    text: "Aguarde.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
      html2pdf()
        .set({
          margin: 10,
          filename: `RetalhosReservados.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(content)
        .save()
        .then(() => {
          Swal.close();
          if (actionsHeader) actionsHeader.classList.remove("pdf-hidden");
          actionsCells.forEach((cell) => cell.classList.remove("pdf-hidden"));
        });
    },
  });
}

export {
  handleLoadRetalhos,
  handleFilterFormChange,
  handleClearFilters,
  handlePageChange,
  handleSort,
  handleLoadFilterOptions,
  handleLoadTiposParaFiltro,
  handleLoadEspessurasParaFiltro,
  handleOpenRegisterModal,
  handleOpenEditModal,
  handleMaterialCadastroChange,
  handleTipoCadastroChange,
  handleSalvarNovoMaterial,
  handleSalvarNovoTipo,
  handleClearRegisterForm,
  handleRegisterSubmit,
  handleReserveClick,
  handleConfirmReserve,
  handleOpenHistoryModal,
  handleSearchReserved,
  handleFetchReservedItems,
  handleCancelReserve,
  handleGeneratePdf,
  handleDeleteRetalho,
  handleBaixaRetalho,
};
