export const ui = {
  // Autenticação
  userEmailSpan: document.getElementById("user-email"),
  logoutBtn: document.getElementById("logout-btn"),
  authenticatedContent: document.getElementById("authenticated-content"),
  unauthenticatedContent: document.getElementById("unauthenticated-content"),
  adminContent: document.getElementById("admin-content"),
  userContent: document.getElementById("user-content"),

  // Filtros
  filterForm: document.getElementById("filter-form"),
  materialSelect: document.getElementById("material"),
  tipoSelect: document.getElementById("tipo"),
  espessuraSelect: document.getElementById("espessura"),
  larguraInput: document.getElementById("largura"),
  alturaInput: document.getElementById("altura"),
  clearBtn: document.getElementById("clear-btn"),

  // Resultados e Controles
  resultsTableBody: document.getElementById("tabela-retalhos-body"),
  resultsCardsContainer: document.getElementById("cards-container"),
  loader: document.getElementById("loader"),
  emptyState: document.getElementById("empty-state"),
  resultsContainer: document.getElementById("results-container"),
  paginationControls: document.getElementById("pagination-controls"),
  prevPageBtn: document.getElementById("prev-page-btn"),
  nextPageBtn: document.getElementById("next-page-btn"),
  pageInfo: document.getElementById("page-info"),
  tableHeaders: document.querySelectorAll("th[data-sort]"),

  // Modal de Cadastro
  openRegisterModalBtn: document.getElementById("open-register-modal-btn"),
  registerModal: document.getElementById("register-modal"),
  closeRegisterModalBtn: document.getElementById("close-register-modal-btn"),
  registerForm: document.getElementById("register-form"),
  regMaterialSelect: document.getElementById("reg-material"),
  regNovoMaterialContainer: document.getElementById(
    "reg-novo-material-container"
  ),
  regNovoMaterialInput: document.getElementById("reg-novo-material-input"),
  regSalvarNovoMaterialBtn: document.getElementById(
    "reg-salvar-novo-material-btn"
  ),
  regCancelarNovoMaterialBtn: document.getElementById(
    "reg-cancelar-novo-material-btn"
  ),
  regTipoSelect: document.getElementById("reg-tipo"),
  regNovoTipoContainer: document.getElementById("reg-novo-tipo-container"),
  regNovoTipoInput: document.getElementById("reg-novo-tipo-input"),
  regSalvarNovoTipoBtn: document.getElementById("reg-salvar-novo-tipo-btn"),
  regCancelarNovoTipoBtn: document.getElementById("reg-cancelar-novo-tipo-btn"),
  regSubmitBtn: document.getElementById("reg-submit-btn"),
  regClearBtn: document.getElementById("reg-clear-btn"),

  // Modal de Reserva
  reserveModal: document.getElementById("reserve-modal"),
  reserveForm: document.getElementById("reserve-form"),
  reserveInputOs: document.getElementById("reserve-input-os"),
  reserveInputQuantidade: document.getElementById("reserve-input-quantidade"),
  reserveQuantityContainer: document.getElementById(
    "reserve-quantity-container"
  ),
  reserveAvailableText: document.getElementById("reserve-available"),
  reserveConfirmBtn: document.getElementById("reserve-confirm-btn"),
  closeReserveModalBtn: document.getElementById("close-reserve-modal-btn"),

  // Modal de Reservados (PDF)
  showReservedBtn: document.getElementById("show-reserved-btn"),
  reservedModal: document.getElementById("reserved-modal"),
  reservedModalContent: document.getElementById("pdf-content"),
  closeReservedModalBtn: document.getElementById("close-reserved-modal-btn"),
  modalLoader: document.getElementById("modal-loader"),
  createPdfBtn: document.getElementById("create-pdf-btn"),
  osSearchInput: document.getElementById("os-search-input"),
};
