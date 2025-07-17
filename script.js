import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rlgsehxrpkxlavxdpzgz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ3NlaHhycGt4bGF2eGRwemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTY2MjgsImV4cCI6MjA2ODE3MjYyOH0.S_doyB0_3GuKRWCb0RXOXzTBvhsiEp_l9X0kWMt86Xg"
);

// --- Elementos de UI para Autenticação (Revisado para pegar do DOM) ---
const userEmailSpan = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");
// Conteúdos principais que serão exibidos/escondidos
const authenticatedContent = document.getElementById("authenticated-content");
const unauthenticatedContent = document.getElementById("unauthenticated-content");
// Conteúdos específicos por papel (role)
const adminContent = document.getElementById("admin-content");
const userContent = document.getElementById("user-content");
// --- Fim dos Elementos de UI para Autenticação ---

// --- Elementos de UI já existentes no seu HTML (mantidos como estão) ---
const form = document.getElementById("filter-form");
const materialSelect = document.getElementById("material");
const tipoSelect = document.getElementById("tipo");
const espessuraSelect = document.getElementById("espessura");
const larguraInput = document.getElementById("largura");
const alturaInput = document.getElementById("altura");
const clearBtn = document.getElementById("clear-btn");

const resultsTableBody = document.getElementById("tabela-retalhos-body");
const resultsCardsContainer = document.getElementById("cards-container");
const loader = document.getElementById("loader");
const emptyState = document.getElementById("empty-state");
const resultsContainer = document.getElementById("results-container");

const paginationControls = document.getElementById("pagination-controls");
const prevPageBtn = document.getElementById("prev-page-btn");
const nextPageBtn = document.getElementById("next-page-btn");
const pageInfo = document.getElementById("page-info");
const tableHeaders = document.querySelectorAll("th[data-sort]");

const showReservedBtn = document.getElementById("show-reserved-btn");
const reservedModal = document.getElementById("reserved-modal");
const reservedModalContent = document.getElementById("pdf-content");
const closeModalBtn = document.getElementById("close-reserved-modal-btn");
const modalLoader = document.getElementById("modal-loader");
const createPdfBtn = document.getElementById("create-pdf-btn");
const osSearchInput = document.getElementById("os-search-input");

const openRegisterModalBtn = document.getElementById("open-register-modal-btn");
const registerModal = document.getElementById("register-modal");
const closeRegisterModalBtn = document.getElementById("close-register-modal-btn");
const registerForm = document.getElementById("register-form");
const regMaterialSelect = document.getElementById("reg-material");
const regNovoMaterialContainer = document.getElementById("reg-novo-material-container");
const regNovoMaterialInput = document.getElementById("reg-novo-material-input");
const regSalvarNovoMaterialBtn = document.getElementById("reg-salvar-novo-material-btn");
const regCancelarNovoMaterialBtn = document.getElementById("reg-cancelar-novo-material-btn");
const regTipoSelect = document.getElementById("reg-tipo");
const regNovoTipoContainer = document.getElementById("reg-novo-tipo-container");
const regNovoTipoInput = document.getElementById("reg-novo-tipo-input");
const regSalvarNovoTipoBtn = document.getElementById("reg-salvar-novo-tipo-btn");
const regCancelarNovoTipoBtn = document.getElementById("reg-cancelar-novo-tipo-btn");
const regSubmitBtn = document.getElementById("reg-submit-btn");
const regClearBtn = document.getElementById("reg-clear-btn");

const reserveModal = document.getElementById("reserve-modal");
const reserveForm = document.getElementById("reserve-form");
const reserveInputOs = document.getElementById("reserve-input-os");
const reserveInputQuantidade = document.getElementById("reserve-input-quantidade");
const reserveQuantityContainer = document.getElementById("reserve-quantity-container");
const reserveAvailableText = document.getElementById("reserve-available");
const reserveConfirmBtn = document.getElementById("reserve-confirm-btn");
const closeReserveModalBtn = document.getElementById("close-reserve-modal-btn");
let currentRetalhoId = null;
let currentQuantidadeDisponivel = 0;

let existingMaterials = [];
let existingTypes = [];
let currentPage = 1;
let totalItems = 0;
const itemsPerPage = 10;
let sortColumn = "numero";
let sortDirection = true;

const camposObrigatoriosCadastro = [
  "reg-numero",
  "reg-gaveta",
  "reg-material",
  "reg-tipo",
  "reg-espessura",
  "reg-comprimento",
  "reg-largura",
  "reg-quantidade",
];

// --- Funções Auxiliares (mantidas as suas e adicionadas novas para autenticação) ---

const openModal = (modalElement) => {
  modalElement.classList.remove("hidden");
  setTimeout(() => {
    // Certifique-se de que o elemento transformador existe, pode ser um div filho direto
    const transformElement = modalElement.querySelector(".transform");
    if (transformElement) {
      transformElement.classList.remove("scale-95", "opacity-0");
      transformElement.classList.add("scale-100", "opacity-100");
    }
  }, 10);
};

const closeModal = (modalElement) => {
  const transformElement = modalElement.querySelector(".transform");
  if (transformElement) {
    transformElement.classList.remove("scale-100", "opacity-100");
    transformElement.classList.add("scale-95", "opacity-0");
  }
  setTimeout(() => {
    modalElement.classList.add("hidden");
  }, 300);
};

const toggleClearButtonVisibility = () => {
  const hasFilter =
    materialSelect.value ||
    tipoSelect.value ||
    espessuraSelect.value ||
    larguraInput.value ||
    alturaInput.value;
  if (hasFilter) {
    clearBtn.classList.remove("hidden");
  } else {
    clearBtn.classList.add("hidden");
  }
};

const addAndSelectOption = (selectElement, value, text) => {
  const newOption = document.createElement("option");
  newOption.value = value;
  newOption.textContent = text;
  // Insere antes da última opção (que geralmente é "-- Novo Material/Tipo --")
  const lastOption = selectElement.lastElementChild;
  if (lastOption && (lastOption.value === "novo-material" || lastOption.value === "novo-tipo")) {
    selectElement.insertBefore(newOption, lastOption);
  } else {
    selectElement.appendChild(newOption); // Se não houver opção "novo-material/tipo", apenas adiciona ao final
  }
  selectElement.value = value;
};

const carregarMateriais = async (selectedMaterial = "") => {
  const { data, error } = await supabase
    .from("retalhos")
    .select("material")
    .order("material", { ascending: true });
  if (error) {
    console.error("Erro ao carregar materiais:", error);
    return;
  }
  const materiaisUnicos = [
    ...new Set(data.map((item) => item.material)),
  ].filter(Boolean);
  existingMaterials = materiaisUnicos.map((m) => m.toLowerCase());
  regMaterialSelect.innerHTML = `<option value="">Selecione...</option>`;
  materiaisUnicos.forEach((material) => {
    const option = document.createElement("option");
    option.value = material;
    option.textContent = material;
    regMaterialSelect.appendChild(option);
  });
  regMaterialSelect.innerHTML += `<option value="novo-material">-- Novo Material --</option>`;
  if (selectedMaterial) {
    regMaterialSelect.value = selectedMaterial;
  }
};

const carregarTipos = async (selectedTipo = "") => {
  const { data, error } = await supabase
    .from("retalhos")
    .select("tipo")
    .order("tipo", { ascending: true });
  if (error) {
    console.error("Erro ao carregar tipos:", error);
    return;
  }
  const tiposUnicos = [...new Set(data.map((item) => item.tipo))].filter(
    Boolean
  );
  existingTypes = tiposUnicos.map((t) => t.toLowerCase());
  regTipoSelect.innerHTML = `<option value="">Selecione...</option>`;
  tiposUnicos.forEach((tipo) => {
    const option = document.createElement("option");
    option.value = tipo;
    option.textContent = tipo;
    regTipoSelect.appendChild(option);
  });
  regTipoSelect.innerHTML += `<option value="novo-tipo">-- Novo Tipo --</option>`;
  if (selectedTipo) {
    regTipoSelect.value = selectedTipo;
  }
};

const carregarFiltros = async () => {
  // Carregar materiais para o filtro
  const { data: materiais, error: materialError } = await supabase
    .from("retalhos")
    .select("material")
    .order("material", { ascending: true });
  if (materialError) {
    console.error("Erro ao carregar materiais para filtro:", materialError);
  } else {
    const materiaisUnicos = [
      ...new Set(materiais.map((item) => item.material)),
    ].filter(Boolean);
    materialSelect.innerHTML = '<option value="">Todos</option>';
    materiaisUnicos.forEach((material) => {
      const option = document.createElement("option");
      option.value = material;
      option.textContent = material;
      materialSelect.appendChild(option);
    });
  }

  // Carregar tipos para o filtro
  const { data: tipos, error: tipoError } = await supabase
    .from("retalhos")
    .select("tipo")
    .order("tipo", { ascending: true });
  if (tipoError) {
    console.error("Erro ao carregar tipos para filtro:", tipoError);
  } else {
    const tiposUnicos = [...new Set(tipos.map((item) => item.tipo))].filter(
      Boolean
    );
    tipoSelect.innerHTML = '<option value="">Todos</option>';
    tiposUnicos.forEach((tipo) => {
      const option = document.createElement("option");
      option.value = tipo;
      option.textContent = tipo;
      tipoSelect.appendChild(option);
    });
  }

  // Carregar espessuras para o filtro
  const { data: espessuras, error: espessuraError } = await supabase
    .from("retalhos")
    .select("espessura")
    .order("espessura", { ascending: true });
  if (espessuraError) {
    console.error("Erro ao carregar espessuras para filtro:", espessuraError);
  } else {
    const espessurasUnicas = [
      ...new Set(espessuras.map((item) => item.espessura)),
    ].filter(Boolean);
    espessuraSelect.innerHTML = '<option value="">Todas</option>';
    espessurasUnicas.forEach((espessura) => {
      const option = document.createElement("option");
      option.value = espessura;
      option.textContent = espessura;
      espessuraSelect.appendChild(option);
    });
  }
};

const validateForm = (formId, fields) => {
  let isValid = true;
  const formElement = document.getElementById(formId);

  fields.forEach((fieldId) => {
    const input = formElement.querySelector(`#${fieldId}`);
    // Ajuste para lidar com selects e inputs de texto/número
    if (input) {
      const parent = input.closest("div");
      if (!input.value.trim()) { // Use .trim() para strings e verifique se não está vazio
        parent.classList.add("has-error");
        isValid = false;
      } else {
        parent.classList.remove("has-error");
      }
    }
  });
  return isValid;
};

const resetForm = (formId) => {
  const formElement = document.getElementById(formId);
  formElement.reset();
  camposObrigatoriosCadastro.forEach((fieldId) => {
    const input = formElement.querySelector(`#${fieldId}`);
    if (input) {
      const parent = input.closest("div");
      parent.classList.remove("has-error");
    }
  });
  // Recarrega os selects de material e tipo para garantir estado inicial
  carregarMateriais();
  carregarTipos();
  // Esconde os campos de novo material/tipo
  regNovoMaterialContainer.classList.add("hidden");
  regNovoMaterialInput.value = ""; // Limpa o input
  regNovoTipoContainer.classList.add("hidden");
  regNovoTipoInput.value = ""; // Limpa o input
};

const formatDecimal = (value) => {
  if (value === null || value === undefined) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  return num.toFixed(2).replace(".", ",");
};

const parseDecimal = (value) => {
  if (typeof value === "string") {
    // Permite que o usuário use ',' ou '.' como separador decimal
    return parseFloat(value.replace(",", "."));
  }
  return value;
};

const renderRetalhos = (retalhos) => {
  resultsTableBody.innerHTML = "";
  resultsCardsContainer.innerHTML = "";

  if (retalhos.length === 0) {
    emptyState.classList.remove("hidden");
    resultsContainer.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  resultsContainer.classList.remove("hidden");

  retalhos.forEach((retalho) => {
    // Renderiza linha da tabela (para desktop)
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50";
    row.innerHTML = `
        <td class="p-3 whitespace-nowrap text-sm text-gray-900 text-center">${retalho.numero}</td>
        <td class="p-3 whitespace-nowrap text-sm text-gray-900 text-center">${retalho.gaveta}</td>
        <td class="p-3 whitespace-nowrap text-sm text-gray-900 text-center">${retalho.material}</td>
        <td class="p-3 whitespace-nowrap text-sm text-gray-900 text-center">${retalho.tipo}</td>
        <td class="p-3 whitespace-nowrap text-sm text-gray-900 text-center">${formatDecimal(retalho.espessura)}</td>
        <td class="p-3 whitespace-nowrap text-sm text-gray-900 text-center">${formatDecimal(retalho.comprimento)}</td>
        <td class="p-3 whitespace-nowrap text-sm text-gray-900 text-center">${formatDecimal(retalho.largura)}</td>
        <td class="p-3 whitespace-nowrap text-sm text-gray-900 text-center">${retalho.quantidade}</td>
        <td class="p-3 whitespace-nowrap text-sm text-gray-900">${retalho.obs || ""}</td>
        <td class="p-3 whitespace-nowrap text-sm text-center action-buttons-cell">
            </td>
    `;
    resultsTableBody.appendChild(row);

    // Renderiza card (para mobile)
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow-md";
    card.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-semibold text-gray-900">Nº ${retalho.numero}</h3>
            <div class="flex space-x-2 card-action-buttons">
                </div>
        </div>
        <p class="text-sm text-gray-700"><strong>Gaveta:</strong> ${retalho.gaveta}</p>
        <p class="text-sm text-gray-700"><strong>Material:</strong> ${retalho.material}</p>
        <p class="text-sm text-gray-700"><strong>Tipo:</strong> ${retalho.tipo}</p>
        <p class="text-sm text-gray-700"><strong>Espessura:</strong> ${formatDecimal(retalho.espessura)} mm</p>
        <p class="text-sm text-gray-700"><strong>Comprimento:</strong> ${formatDecimal(retalho.comprimento)} m</p>
        <p class="text-sm text-gray-700"><strong>Largura:</strong> ${formatDecimal(retalho.largura)} m</p>
        <p class="text-sm text-gray-700"><strong>Quantidade:</strong> ${retalho.quantidade}</p>
        <p class="text-sm text-gray-700"><strong>Obs:</strong> ${retalho.obs || "N/A"}</p>
    `;
    resultsCardsContainer.appendChild(card);
  });

  // Chame a função para atualizar a visibilidade dos botões após a renderização
  updateActionButtonsVisibility();
};


const fetchRetalhos = async (filters = {}) => {
  loader.classList.remove("hidden");
  emptyState.classList.add("hidden");
  resultsContainer.classList.add("hidden");
  paginationControls.classList.add("hidden"); // Esconde paginação durante o carregamento

  let query = supabase.from("retalhos").select("*", { count: "exact" });

  if (filters.material) query = query.eq("material", filters.material);
  if (filters.tipo) query = query.eq("tipo", filters.tipo);
  if (filters.espessura) query = query.eq("espessura", filters.espessura);
  if (filters.largura) query = query.gte("largura", filters.largura);
  if (filters.altura) query = query.gte("comprimento", filters.altura);

  // Filtra apenas retalhos com quantidade > 0
  query = query.gt("quantidade", 0);

  // Adiciona ordenação
  query = query.order(sortColumn, { ascending: sortDirection });

  // Adiciona paginação
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Erro ao buscar retalhos:", error);
    Swal.fire({
      icon: "error",
      title: "Erro de Busca",
      text: "Ocorreu um erro ao buscar os retalhos. Tente novamente.",
    });
    loader.classList.add("hidden");
    emptyState.classList.remove("hidden"); // Mostra empty state se houver erro ou não encontrar
    return;
  }

  totalItems = count;
  renderRetalhos(data); // Chama renderRetalhos que agora chama updateActionButtonsVisibility
  updatePaginationControls();
  loader.classList.add("hidden");
  paginationControls.classList.remove("hidden"); // Mostra paginação após o carregamento
};

const updatePaginationControls = () => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
};

// --- Funções de Eventos ---

form.addEventListener("submit", (e) => {
  e.preventDefault();
  currentPage = 1; // Volta para a primeira página ao aplicar novo filtro
  const filters = {
    material: materialSelect.value,
    tipo: tipoSelect.value,
    espessura: espessuraSelect.value ? parseFloat(espessuraSelect.value) : "",
    largura: larguraInput.value ? parseFloat(larguraInput.value) : "",
    altura: alturaInput.value ? parseFloat(alturaInput.value) : "",
  };
  fetchRetalhos(filters);
  toggleClearButtonVisibility();
});

clearBtn.addEventListener("click", () => {
  form.reset();
  materialSelect.value = "";
  tipoSelect.value = "";
  espessuraSelect.value = "";
  larguraInput.value = "";
  alturaInput.value = "";
  currentPage = 1;
  fetchRetalhos(); // Recarrega todos os retalhos
  toggleClearButtonVisibility();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    const filters = {
      material: materialSelect.value,
      tipo: tipoSelect.value,
      espessura: espessuraSelect.value
        ? parseFloat(espessuraSelect.value)
        : "",
      largura: larguraInput.value ? parseFloat(larguraInput.value) : "",
      altura: alturaInput.value ? parseFloat(alturaInput.value) : "",
    };
    fetchRetalhos(filters);
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    const filters = {
      material: materialSelect.value,
      tipo: tipoSelect.value,
      espessura: espessuraSelect.value
        ? parseFloat(espessuraSelect.value)
        : "",
      largura: larguraInput.value ? parseFloat(larguraInput.value) : "",
      altura: alturaInput.value ? parseFloat(alturaInput.value) : "",
    };
    fetchRetalhos(filters);
  }
});

tableHeaders.forEach((header) => {
  header.addEventListener("click", () => {
    const column = header.dataset.sort;
    if (sortColumn === column) {
      sortDirection = !sortDirection; // Inverte a direção se a mesma coluna for clicada
    } else {
      sortColumn = column;
      sortDirection = true; // Define ascendente por padrão para nova coluna
    }

    // Remove as classes de ordenação de todos os cabeçalhos
    tableHeaders.forEach((h) => {
      h.classList.remove("sort-asc", "sort-desc");
    });

    // Adiciona a classe de ordenação ao cabeçalho clicado
    header.classList.add(sortDirection ? "sort-asc" : "sort-desc");

    currentPage = 1; // Volta para a primeira página ao reordenar
    const filters = {
      material: materialSelect.value,
      tipo: tipoSelect.value,
      espessura: espessuraSelect.value
        ? parseFloat(espessuraSelect.value)
        : "",
      largura: larguraInput.value ? parseFloat(larguraInput.value) : "",
      altura: alturaInput.value ? parseFloat(alturaInput.value) : "",
    };
    fetchRetalhos(filters);
  });
});

// --- Modais de Registro ---
openRegisterModalBtn.addEventListener("click", () => {
  resetForm("register-form");
  openModal(registerModal);
});

closeRegisterModalBtn.addEventListener("click", () => {
  closeModal(registerModal);
});

regMaterialSelect.addEventListener("change", () => {
  if (regMaterialSelect.value === "novo-material") {
    regNovoMaterialContainer.classList.remove("hidden");
    regNovoMaterialInput.focus();
  } else {
    regNovoMaterialContainer.classList.add("hidden");
    regNovoMaterialInput.value = "";
  }
});

regSalvarNovoMaterialBtn.addEventListener("click", () => {
  const novoMaterial = regNovoMaterialInput.value.trim();
  if (novoMaterial && !existingMaterials.includes(novoMaterial.toLowerCase())) {
    addAndSelectOption(regMaterialSelect, novoMaterial, novoMaterial);
    existingMaterials.push(novoMaterial.toLowerCase());
    regNovoMaterialContainer.classList.add("hidden");
    regNovoMaterialInput.value = "";
    // Atualiza também os filtros de busca
    carregarFiltros();
  } else if (novoMaterial && existingMaterials.includes(novoMaterial.toLowerCase())) {
    Swal.fire({
      icon: "info",
      title: "Material Existente",
      text: "Este material já existe na lista.",
    });
    regMaterialSelect.value = novoMaterial; // Seleciona o material existente
    regNovoMaterialContainer.classList.add("hidden");
    regNovoMaterialInput.value = "";
  } else {
    Swal.fire({
      icon: "warning",
      title: "Nome Inválido",
      text: "Por favor, insira um nome válido para o novo material.",
    });
  }
});

regCancelarNovoMaterialBtn.addEventListener("click", () => {
  regMaterialSelect.value = ""; // Volta para a opção "Selecione..."
  regNovoMaterialContainer.classList.add("hidden");
  regNovoMaterialInput.value = "";
});

regTipoSelect.addEventListener("change", () => {
  if (regTipoSelect.value === "novo-tipo") {
    regNovoTipoContainer.classList.remove("hidden");
    regNovoTipoInput.focus();
  } else {
    regNovoTipoContainer.classList.add("hidden");
    regNovoTipoInput.value = "";
  }
});

regSalvarNovoTipoBtn.addEventListener("click", () => {
  const novoTipo = regNovoTipoInput.value.trim();
  if (novoTipo && !existingTypes.includes(novoTipo.toLowerCase())) {
    addAndSelectOption(regTipoSelect, novoTipo, novoTipo);
    existingTypes.push(novoTipo.toLowerCase());
    regNovoTipoContainer.classList.add("hidden");
    regNovoTipoInput.value = "";
    // Atualiza também os filtros de busca
    carregarFiltros();
  } else if (novoTipo && existingTypes.includes(novoTipo.toLowerCase())) {
    Swal.fire({
      icon: "info",
      title: "Tipo Existente",
      text: "Este tipo já existe na lista.",
    });
    regTipoSelect.value = novoTipo; // Seleciona o tipo existente
    regNovoTipoContainer.classList.add("hidden");
    regNovoTipoInput.value = "";
  } else {
    Swal.fire({
      icon: "warning",
      title: "Nome Inválido",
      text: "Por favor, insira um nome válido para o novo tipo.",
    });
  }
});

regCancelarNovoTipoBtn.addEventListener("click", () => {
  regTipoSelect.value = ""; // Volta para a opção "Selecione..."
  regNovoTipoContainer.classList.add("hidden");
  regNovoTipoInput.value = "";
});

regClearBtn.addEventListener("click", () => {
  resetForm("register-form");
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm("register-form", camposObrigatoriosCadastro)) {
    Swal.fire({
      icon: "error",
      title: "Campos Obrigatórios",
      text: "Por favor, preencha todos os campos obrigatórios.",
    });
    return;
  }

  regSubmitBtn.disabled = true;
  regSubmitBtn.querySelector(".reg-spinner").classList.remove("hidden");
  regSubmitBtn.querySelector(".reg-btn-text").textContent = "Salvando...";

  const formData = new FormData(registerForm);
  const novoRetalho = {
    numero: parseInt(formData.get("reg-numero")), // Corrigido para "reg-numero"
    gaveta: formData.get("reg-gaveta"), // Corrigido para "reg-gaveta"
    material: formData.get("reg-material"), // Corrigido para "reg-material"
    tipo: formData.get("reg-tipo"), // Corrigido para "reg-tipo"
    espessura: parseDecimal(formData.get("reg-espessura")), // Corrigido para "reg-espessura"
    comprimento: parseDecimal(formData.get("reg-comprimento")), // Corrigido para "reg-comprimento"
    largura: parseDecimal(formData.get("reg-largura")), // Corrigido para "reg-largura"
    quantidade: parseInt(formData.get("reg-quantidade")), // Corrigido para "reg-quantidade"
    obs: formData.get("reg-obs"), // Corrigido para "reg-obs"
    created_at: new Date().toISOString(), // Adiciona o timestamp
  };

  try {
    const { data, error } = await supabase.from("retalhos").insert([novoRetalho]);

    if (error) {
      throw error;
    }

    Swal.fire({
      icon: "success",
      title: "Sucesso!",
      text: "Retalho cadastrado com sucesso!",
      showConfirmButton: false,
      timer: 1500,
    });
    resetForm("register-form");
    closeModal(registerModal);
    fetchRetalhos(); // Recarrega a lista de retalhos
    carregarFiltros(); // Recarrega os filtros
  } catch (error) {
    console.error("Erro ao cadastrar retalho:", error.message);
    Swal.fire({
      icon: "error",
      title: "Erro no Cadastro",
      text: error.message || "Ocorreu um erro ao cadastrar o retalho.",
    });
  } finally {
    regSubmitBtn.disabled = false;
    regSubmitBtn.querySelector(".reg-spinner").classList.add("hidden");
    regSubmitBtn.querySelector(".reg-btn-text").textContent =
      "Cadastrar Retalho";
  }
});

// --- Modais de Reserva ---
const handleReserveClick = async (event) => {
  const retalhoId = event.currentTarget.dataset.id;
  currentRetalhoId = retalhoId;

  // Busca a quantidade disponível do retalho
  const { data, error } = await supabase
    .from("retalhos")
    .select("quantidade")
    .eq("id", retalhoId)
    .single();

  if (error || !data) {
    console.error("Erro ao carregar quantidade do retalho:", error); // Adicionado console.error
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Não foi possível carregar a quantidade do retalho.",
    });
    return;
  }

  currentQuantidadeDisponivel = data.quantidade;
  reserveInputQuantidade.max = currentQuantidadeDisponivel; // Define o máximo no input
  reserveInputQuantidade.value = Math.min(1, currentQuantidadeDisponivel); // Sugere 1 ou o disponível
  reserveAvailableText.textContent = `Disponível: ${currentQuantidadeDisponivel} retalho(s).`;
  reserveQuantityContainer.classList.remove("hidden");
  reserveInputOs.value = ""; // Limpa o campo OS
  reserveConfirmBtn.disabled = currentQuantidadeDisponivel === 0; // Desabilita se não houver quantidade
  openModal(reserveModal);
};

closeReserveModalBtn.addEventListener("click", () => {
  closeModal(reserveModal);
  reserveQuantityContainer.classList.add("hidden"); // Esconde o campo de quantidade ao fechar
});

reserveConfirmBtn.addEventListener("click", async () => {
  const os = reserveInputOs.value.trim();
  const quantidadeReservar = parseInt(reserveInputQuantidade.value);

  if (!os) {
    Swal.fire({
      icon: "warning",
      title: "Campo Obrigatório",
      text: "Por favor, insira o número da OS.",
    });
    return;
  }
  if (isNaN(quantidadeReservar) || quantidadeReservar <= 0) {
    Swal.fire({
      icon: "warning",
      title: "Quantidade Inválida",
      text: "Por favor, insira uma quantidade válida para reservar.",
    });
    return;
  }
  if (quantidadeReservar > currentQuantidadeDisponivel) {
    Swal.fire({
      icon: "warning",
      title: "Quantidade Excedida",
      text: `Você não pode reservar mais do que ${currentQuantidadeDisponivel} retalho(s).`,
    });
    return;
  }

  reserveConfirmBtn.disabled = true;

  try {
    // 1. Inserir na tabela 'reservados'
    const { error: reserveError } = await supabase.from("reservados").insert([
      {
        retalho_id: currentRetalhoId,
        numero_os: os,
        quantidade_reservada: quantidadeReservar,
        data_reserva: new Date().toISOString(),
       // -- adiciona user_id para registrar quem reservou --
        user_id: supabase.auth.user()?.id // Pega o ID do usuário logado
      },
    ]);

    if (reserveError) {
      throw reserveError;
    }

    // 2. Atualizar a quantidade na tabela 'retalhos'
    const novaQuantidade = currentQuantidadeDisponivel - quantidadeReservar;
    const { error: updateError } = await supabase
      .from("retalhos")
      .update({ quantidade: novaQuantidade })
      .eq("id", currentRetalhoId);

    if (updateError) {
      throw updateError;
    }

    Swal.fire({
      icon: "success",
      title: "Reserva Confirmada!",
      text: `Foram reservados ${quantidadeReservar} retalho(s) para a OS ${os}.`,
      showConfirmButton: false,
      timer: 2000,
    });

    closeModal(reserveModal);
    fetchRetalhos(); // Recarrega a lista para mostrar a quantidade atualizada
  } catch (error) {
    console.error("Erro ao confirmar reserva:", error.message);
    Swal.fire({
      icon: "error",
      title: "Erro na Reserva",
      text: error.message || "Ocorreu um erro ao processar a reserva.",
    });
  } finally {
    reserveConfirmBtn.disabled = false;
  }
});

// --- Deleção de Retalho ---
const handleDeleteClick = async (event) => {
  const retalhoId = event.currentTarget.dataset.id;

  Swal.fire({
    title: "Tem certeza?",
    text: "Esta ação não poderá ser desfeita!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sim, excluir!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const { error } = await supabase
        .from("retalhos")
        .delete()
        .eq("id", retalhoId);

      if (error) {
        console.error("Erro ao excluir retalho:", error.message);
        Swal.fire({
          icon: "error",
          title: "Erro ao Excluir",
          text: error.message,
        });
      } else {
        Swal.fire("Excluído!", "O retalho foi excluído com sucesso.", "success");
        fetchRetalhos(); // Recarrega a lista de retalhos
      }
    }
  });
};

// --- Funções para Retalhos Reservados (Modal PDF) ---
showReservedBtn.addEventListener("click", () => {
  openModal(reservedModal);
  searchReservedRetalhos(); // Carrega os retalhos reservados ao abrir
});

closeModalBtn.addEventListener("click", () => {
  closeModal(reservedModal);
});

osSearchInput.addEventListener("input", () => {
  searchReservedRetalhos(osSearchInput.value.trim());
});

createPdfBtn.addEventListener("click", () => {
  const element = document.getElementById("pdf-content");
  // Certifique-se de que a biblioteca html2pdf esteja carregada antes de usar
  if (typeof html2pdf !== 'undefined') {
    html2pdf().from(element).save("retalhos_reservados.pdf");
  } else {
    console.error("html2pdf não está carregado. Certifique-se de incluir o script.");
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Funcionalidade de PDF não disponível. Tente recarregar a página ou contate o suporte."
    });
  }
});

const searchReservedRetalhos = async (osNumber = "") => {
  modalLoader.classList.remove("hidden");
  reservedModalContent.innerHTML = ""; // Limpa conteúdo anterior

  let query = supabase.from("reservados").select(`
        id,
        numero_os,
        quantidade_reservada,
        data_reserva,
        retalhos (
            numero,
            gaveta,
            material,
            tipo,
            espessura,
            comprimento,
            largura,
            obs
        )
    `);

  if (osNumber) {
    query = query.ilike("numero_os", `%${osNumber}%`);
  }

  query = query.order("data_reserva", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar retalhos reservados:", error);
    reservedModalContent.innerHTML = `
      <p class="text-red-600 text-center">Erro ao carregar retalhos reservados: ${error.message}</p>
    `;
    modalLoader.classList.add("hidden");
    return;
  }

  if (data.length === 0) {
    reservedModalContent.innerHTML = `
      <p class="text-gray-600 text-center">Nenhum retalho reservado encontrado.</p>
    `;
  } else {
    // Organiza os dados para o PDF
    let htmlContent = `
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4 text-center">Relatório de Retalhos Reservados</h2>
    `;

    // Agrupar por OS
    const groupedByOs = data.reduce((acc, item) => {
      const os = item.numero_os;
      if (!acc[os]) {
        acc[os] = [];
      }
      acc[os].push(item);
      return acc;
    }, {});

    for (const os in groupedByOs) {
      htmlContent += `
        <div class="mb-6 border p-4 rounded-lg shadow-sm">
          <h3 class="text-xl font-semibold mb-3">OS: ${os}</h3>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaveta</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Esp. (mm)</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comp. (m)</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Larg. (m)</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd. Res.</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Res.</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
      `;
      groupedByOs[os].forEach(item => {
        const retalho = item.retalhos;
        const dataReservaFormatada = new Date(item.data_reserva).toLocaleDateString('pt-BR');
        htmlContent += `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${retalho.numero}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${retalho.gaveta}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${retalho.material}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${retalho.tipo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDecimal(retalho.espessura)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDecimal(retalho.comprimento)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDecimal(retalho.largura)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.quantidade_reservada}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${dataReservaFormatada}</td>
              </tr>
        `;
      });
      htmlContent += `
            </tbody>
          </table>
        </div>
      `;
    }

    htmlContent += `</div>`;
    reservedModalContent.innerHTML = htmlContent;
  }
  modalLoader.classList.add("hidden");
};


// --- Funções de Autenticação Supabase ---

// Função principal para controlar a visibilidade da UI com base no status de autenticação e no papel do usuário
const toggleUIForAuthStatus = (user, role) => {
  console.log("--- Executando toggleUIForAuthStatus ---");
  console.log("User recebido:", user);
  console.log("Role recebido:", role);

  // Oculta todos os conteúdos por padrão para evitar flashes
  authenticatedContent.classList.add("hidden");
  unauthenticatedContent.classList.add("hidden");
  if (adminContent) adminContent.classList.add("hidden");
  if (userContent) userContent.classList.add("hidden");

  if (user) {
    console.log("Usuário está logado.");
    authenticatedContent.classList.remove("hidden"); // Mostra o container principal autenticado
    logoutBtn.classList.remove("hidden"); // Mostra o botão de sair

    // Mostra conteúdo baseado no papel (role)
    if (role === 'admin') {
      console.log("Role é 'admin'. Exibindo conteúdo de admin.");
      if (adminContent) adminContent.classList.remove("hidden");
      if (userContent) userContent.classList.add("hidden");
      // Certifique-se de que o botão de cadastrar e ver reservados estejam visíveis para admin
      if (openRegisterModalBtn) openRegisterModalBtn.classList.remove('hidden');
      if (showReservedBtn) showReservedBtn.classList.remove('hidden');
    } else if (role === 'user') {
      console.log("Role é 'user'. Exibindo conteúdo de usuário comum.");
      if (userContent) userContent.classList.remove("hidden");
      if (adminContent) adminContent.classList.add("hidden");
      // Para usuário comum, talvez o botão de cadastrar fique hidden, mas o de ver reservados fica visível
      if (openRegisterModalBtn) openRegisterModalBtn.classList.add('hidden');
      if (showReservedBtn) showReservedBtn.classList.remove('hidden');
    } else {
      console.log("Role é indefinido ou diferente de 'admin'/'user'. Exibindo conteúdo de usuário comum por padrão.");
      if (userContent) userContent.classList.remove("hidden");
      // Se o role não estiver definido, pode ser um problema de configuração do perfil
      Swal.fire({
        icon: 'warning',
        title: 'Aviso de Perfil',
        text: 'Seu perfil não tem um papel (role) definido. Contate o administrador.',
      });
      // Ainda oculta o register e mostra o reserved
      if (openRegisterModalBtn) openRegisterModalBtn.classList.add('hidden');
      if (showReservedBtn) showReservedBtn.classList.remove('hidden');
    }

    // Inicializa a busca de retalhos e filtros após o login
    fetchRetalhos();

  } else {
    console.log("Usuário NÃO está logado. Exibindo 'Acesso Restrito'.");
    unauthenticatedContent.classList.remove("hidden"); // Mostra o conteúdo de "Acesso Restrito"
    logoutBtn.classList.add("hidden"); // Oculta o botão de sair
    if (openRegisterModalBtn) openRegisterModalBtn.classList.add('hidden');
    if (showReservedBtn) showReservedBtn.classList.add('hidden');
    userEmailSpan.textContent = "Visitante"; // Limpa o email
    // Redireciona para a página de login se o usuário não estiver autenticado
    // Se você já está na auth.html, não precisa redirecionar de novo.
    // Se esta for a index.html, pode redirecionar para auth.html
    // window.location.href = 'auth.html'; // Remova ou comente se você quer que ele fique na index.html com acesso restrito
  }
  console.log("--- Fim da Execução toggleUIForAuthStatus ---");
};

// Adiciona um listener para o evento de mudança de estado da autenticação do Supabase
supabase.auth.onAuthStateChange(async (event, session) => {
  
  // console.log("Auth state changed:", event, session);
  const user = session?.user;
  let userRole = null;

    if (user) {    
    // Você também pode buscar o perfil do usuário aqui, como já está sendo feito
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      console.log("Papel do usuário (role):", profile.role);
    } else if (error) {
      console.error("Erro ao buscar perfil do usuário para console.log:", error);
    }
  } else {
    console.log("Nenhum usuário logado.");
  }

  if (user) {
    // Se há um usuário, tenta buscar o papel dele na tabela 'profiles'
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      // Se houver erro ou perfil não encontrado, assume um papel padrão ou redireciona
      // Para este caso, vamos assumir 'user' para permitir acesso básico se o perfil não for encontrado
      userRole = 'user';
      Swal.fire({
        icon: 'error',
        title: 'Erro de Perfil',
        text: 'Não foi possível carregar seu perfil. Acesso limitado. Contate o suporte.',
      });
    } else if (profile) {
      userRole = profile.role;
    } else {
        // Se o perfil não for encontrado (ex: usuário recém-criado e o trigger falhou)
        console.warn("Perfil não encontrado para o usuário:", user.id);
        userRole = 'user'; // Assume 'user' como padrão
        Swal.fire({
            icon: 'warning',
            title: 'Perfil não encontrado',
            text: 'Seu perfil pode estar incompleto. Acesso limitado. Contate o suporte.',
        });
    }
  }

  // Chama a função para atualizar a UI com base no status e papel
  toggleUIForAuthStatus(user, userRole);
});

// Event Listener para Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
      Swal.fire({
        icon: "error",
        title: "Erro ao Sair",
        text: "Ocorreu um erro ao tentar sair. Tente novamente.",
      });
    } else {
      // O onAuthStateChange cuidará do redirecionamento
      Swal.fire({
        icon: "success",
        title: "Até logo!",
        text: "Você foi desconectado.",
        showConfirmButton: false,
        timer: 1000,
      });
      // Limpa Local Storage do Supabase (opcional, mas bom para garantir)
      localStorage.removeItem(`sb-${supabase.supabaseUrl.split('.')[0].split('//')[1]}-auth-token`);
    }
  });
}

// Função para atualizar a visibilidade dos botões de ação (reservar/excluir)
// Esta função será chamada após `renderRetalhos` e no `toggleUIForAuthStatus`
const updateActionButtonsVisibility = () => {
    // Primeiro, remove todos os botões para garantir uma renderização limpa
    document.querySelectorAll(".action-buttons-cell button, .card-action-buttons button").forEach(btn => btn.remove());

    const currentUser = supabase.auth.user();
    let userRole = null;

    if (currentUser) {
        // Sincroniza o role diretamente do perfil para ter certeza
        // NOTA: Em uma aplicação real, você pode querer cachear isso ou passar como parâmetro.
        // Aqui, para simplicidade e garantia de estado, buscamos novamente.
        supabase.from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()
            .then(({ data: profile, error }) => {
                if (error) {
                    console.error("Erro ao buscar role para botões:", error);
                    // Assume user role em caso de erro para não bloquear tudo
                    userRole = 'user';
                } else if (profile) {
                    userRole = profile.role;
                } else {
                    userRole = 'user'; // Perfil não encontrado, assume padrão
                }
                
                applyButtonVisibility(userRole);
            });
    } else {
        // Se não houver usuário logado, não mostra nenhum botão de ação
        applyButtonVisibility(null); 
    }
};

const applyButtonVisibility = (role) => {
    document.querySelectorAll(".action-buttons-cell, .card-action-buttons").forEach(container => {
        const retalhoId = container.closest('tr')?.querySelector('[data-action]')?.dataset.id || container.closest('.bg-white')?.querySelector('[data-action]')?.dataset.id;
        
        // Botão de Reserva (sempre visível para usuários logados)
        if (role) { // Se houver um papel (ou seja, usuário logado)
            const reserveBtn = document.createElement("button");
            reserveBtn.dataset.id = retalhoId;
            reserveBtn.dataset.action = "reserve";
            reserveBtn.className = "reserve-btn bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full inline-flex items-center justify-center shadow-md mr-1";
            reserveBtn.title = "Reservar Retalho";
            reserveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
            reserveBtn.addEventListener("click", handleReserveClick);
            container.appendChild(reserveBtn);
        }

        // Botão de Excluir (apenas para admins)
        if (role === 'admin') {
            const deleteBtn = document.createElement("button");
            deleteBtn.dataset.id = retalhoId;
            deleteBtn.dataset.action = "delete";
            deleteBtn.className = "delete-btn bg-red-500 hover:bg-red-600 text-white p-2 rounded-full inline-flex items-center justify-center shadow-md";
            deleteBtn.title = "Excluir Retalho";
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener("click", handleDeleteClick);
            container.appendChild(deleteBtn);
        }
    });

    // Se o openRegisterModalBtn (para cadastrar) existir
    if (openRegisterModalBtn) {
        if (role === 'admin') {
            openRegisterModalBtn.classList.remove('hidden');
        } else {
            openRegisterModalBtn.classList.add('hidden');
        }
    }

    // Se o showReservedBtn (para ver reservados) existir
    if (showReservedBtn) {
        if (role) { // Visível para qualquer usuário logado
            showReservedBtn.classList.remove('hidden');
        } else {
            showReservedBtn.classList.add('hidden');
        }
    }
};


// --- Inicialização da Aplicação ---
// --- Inicialização da Aplicação ---
document.addEventListener("DOMContentLoaded", async () => {
  // Obter a sessão atual ao carregar a página
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  let userRole = null;

  if (user) {
    // Se houver um usuário logado, busque o papel dele
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

          // ********* LOGS CRÍTICOS PARA DEPURAR *********
    console.log("DOMContentLoaded: Perfil retornado (data):", profileData);
    console.log("DOMContentLoaded: Erro retornado (error):", profileError);
    // **********************************************

      userRole = profile.role;
      console.log("Papel do usuário (DOMContentLoaded):", userRole);

  }

  // Chamar toggleUIForAuthStatus com o usuário e o papel (que pode ser null se não houver login)
  toggleUIForAuthStatus(user, userRole);

  toggleClearButtonVisibility(); // Ajusta a visibilidade do botão "Limpar Filtros"

  // Restante da sua inicialização da UI, se houver
  carregarFiltros(); // Carrega os filtros iniciais
  carregarMateriais(); // Carrega os materiais iniciais
  carregarTipos(); // Carrega os tipos iniciais
  // Não chame fetchRetalhos aqui, pois já será chamado dentro de toggleUIForAuthStatus ou onAuthStateChange
});

// Seu listener onAuthStateChange deve continuar como está, pois ele lida com logins/logouts
// e é o lugar principal para gerenciar o estado da UI dinamicamente.
supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user;
  let userRole = null;

  if (user) {
    userEmailSpan.textContent = user.email; // Atualiza o email na UI

    // Buscar o papel do usuário
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

          // ********* LOGS CRÍTICOS PARA DEPURAR *********
    console.log("onAuthStateChange: Perfil retornado (data):", profileData);
    console.log("onAuthStateChange: Erro retornado (error):", profileError);
    // **********************************************

    if (profile) {
      userRole = profile.role;
      console.log("Papel do usuário (onAuthStateChange):", userRole);
    } else if (error) {
      console.error("Erro ao buscar perfil do usuário no onAuthStateChange:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erro de Perfil',
        text: 'Não foi possível carregar seu perfil. Contate o administrador.',
      });
    }
  } else {
    // Se não há usuário, redefinir o email e o papel
    userEmailSpan.textContent = "Visitante";
    userRole = null;
    console.log("Nenhum usuário logado. Evento:", event);
  }

  // Chamar a função para atualizar a UI com base no estado de autenticação e papel
  toggleUIForAuthStatus(user, userRole);

  // Redireciona para a página de login se o usuário fizer logout
  if (event === 'SIGNED_OUT') {
    window.location.href = 'index.html'; // Ou sua página de login
  }
});