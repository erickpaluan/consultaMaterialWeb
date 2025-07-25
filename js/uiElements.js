const query = (selector) => document.querySelector(selector);
const queryAll = (selector) => document.querySelectorAll(selector);

export const ui = {
  // Autenticação e Layout Geral
  authenticatedContent: query("#authenticated-content"),
  unauthenticatedContent: query("#unauthenticated-content"),
  userInitialsBtn: query("#user-initials-btn"),
  userFullname: query("#user-fullname"),
  userEmailRole: query("#user-email-role"),
  logoutBtn: query("#logout-btn"),
  adminOnlyContent: queryAll(".admin-only"),
  historyModal: query("#history-modal"),
  closeHistoryModalBtn: query("#close-history-modal-btn"),
  historyModalContent: query("#history-modal-content"),

  // Geral
  loader: query("#loader"),
  
  // Filtros de Consulta
  filterForm: query("#form"),
  materialSelect: query("#material-select"),
  tipoSelect: query("#tipo-select"),
  espessuraSelect: query("#espessura-select"),
  larguraInput: query("#largura-input"),
  alturaInput: query("#altura-input"),
  clearBtn: query("#clear-btn"),
  
  // Resultados da Consulta
  resultsContainer: query("#results-container"),
  resultsTable: query("#results-table"),
  resultsTableBody: query("#results-table-body"),
  resultsCardsContainer: query("#results-cards-container"),
  emptyState: query("#empty-state"),
  
  // Paginação
  paginationControls: query("#pagination-controls"),
  prevPageBtn: query("#prev-page-btn"),
  nextPageBtn: query("#next-page-btn"),
  pageInfo: query("#page-info"),

  // Ações
  openRegisterModalBtn: query("#open-register-modal-btn"),
  showReservedBtn: query("#show-reserved-btn"),

  // Modal de Cadastro/Edição
  registerModal: query("#register-modal"),
  closeRegisterModalBtn: query("#close-register-modal-btn"),
  registerModalTitle: query("#register-modal-title"),
  registerForm: query("#register-form"),
  editRetalhoId: query("#edit-retalho-id"),
  regNumero: query("#reg-numero"),
  regGaveta: query("#reg-gaveta"),
  regQuantidade: query("#reg-quantidade"),
  regMaterialSelect: query("#reg-material"),
  regTipoSelect: query("#reg-tipo"),
  regEspessura: query("#reg-espessura"),
  regComprimento: query("#reg-comprimento"),
  regLargura: query("#reg-largura"),
  regObs: query("#reg-obs"),
  regSubmitBtn: query("#reg-submit-btn"),
  regSubmitBtnText: query(".reg-btn-text"),
  regClearBtn: query("#reg-clear-btn"),
  regNovoMaterialContainer: query("#reg-novo-material-container"),
  regNovoMaterialInput: query("#reg-novo-material-input"),
  regSalvarNovoMaterialBtn: query("#reg-salvar-novo-material-btn"),
  regCancelarNovoMaterialBtn: query("#reg-cancelar-novo-material-btn"),
  regNovoTipoContainer: query("#reg-novo-tipo-container"),
  regNovoTipoInput: query("#reg-novo-tipo-input"),
  regSalvarNovoTipoBtn: query("#reg-salvar-novo-tipo-btn"),
  regCancelarNovoTipoBtn: query("#reg-cancelar-novo-tipo-btn"),
  
  // Modal de Reserva
  reserveModal: query("#reserve-modal"),
  closeReserveModalBtn: query("#close-reserve-modal-btn"),
  reserveConfirmBtn: query("#reserve-confirm-btn"),
  reserveInputOs: query("#reserve-input-os"),
  reserveQuantityContainer: query("#reserve-quantity-container"),
  reserveInputQuantidade: query("#reserve-input-quantidade"),
  reserveAvailableText: query("#reserve-available-text"),
  
  // Modal de Itens Reservados
  reservedModal: query("#reserved-modal"),
  closeModalBtn: query("#close-modal-btn"),
  reservedModalContent: query("#reserved-modal-content"),
  reservedModalWrapper: query("#reserved-modal-content-wrapper"),
  modalLoader: query("#modal-loader"),
  osSearchInput: query("#os-search-input"),
  createPdfBtn: query("#create-pdf-btn"),
};