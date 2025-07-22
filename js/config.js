// js/config.js

/**
 * Contém todas as constantes e seletores de DOM da aplicação.
 * Centralizar isso aqui facilita a manutenção, pois se um ID no HTML mudar,
 * só precisamos alterar neste arquivo.
 */

export const ITEMS_PER_PAGE = 10;

export const AUTO_REFRESH_INTERVAL = 300000; // 5 minutos

export const DOM_SELECTORS = {
  // Geral
  loader: "#loader",
  
  // Filtros de Consulta
  filterForm: "#form",
  materialSelect: "#material-select",
  tipoSelect: "#tipo-select",
  espessuraSelect: "#espessura-select",
  larguraInput: "#largura-input",
  alturaInput: "#altura-input",
  clearBtn: "#clear-btn",
  
  // Resultados da Consulta
  resultsContainer: "#results-container",
  resultsTable: "#results-table",
  resultsTableBody: "#results-table-body",
  resultsCardsContainer: "#results-cards-container",
  emptyState: "#empty-state",
  
  // Paginação
  paginationControls: "#pagination-controls",
  prevPageBtn: "#prev-page-btn",
  nextPageBtn: "#next-page-btn",
  pageInfo: "#page-info",

  // Botões de Ação Principal
  openRegisterModalBtn: "#open-register-modal-btn",
  showReservedBtn: "#show-reserved-btn",

  // Modal de Cadastro de Retalho
  registerModal: "#register-modal",
  closeRegisterModalBtn: "#close-register-modal-btn",
  registerForm: "#register-form",
  regNumero: "#reg-numero",
  regGaveta: "#reg-gaveta",
  regMaterialSelect: "#reg-material",
  regTipoSelect: "#reg-tipo",
  regEspessura: "#reg-espessura",
  regComprimento: "#reg-comprimento",
  regLargura: "#reg-largura",
  regQuantidade: "#reg-quantidade",
  regObs: "#reg-obs",
  regSubmitBtn: "#reg-submit-btn",
  regSubmitBtnSpinner: ".reg-spinner",
  regSubmitBtnText: ".reg-btn-text",
  regClearBtn: "#reg-clear-btn",
  regNovoMaterialContainer: "#reg-novo-material-container",
  regNovoMaterialInput: "#reg-novo-material-input",
  regSalvarNovoMaterialBtn: "#reg-salvar-novo-material-btn",
  regCancelarNovoMaterialBtn: "#reg-cancelar-novo-material-btn",
  regNovoTipoContainer: "#reg-novo-tipo-container",
  regNovoTipoInput: "#reg-novo-tipo-input",
  regSalvarNovoTipoBtn: "#reg-salvar-novo-tipo-btn",
  regCancelarNovoTipoBtn: "#reg-cancelar-novo-tipo-btn",
  
  // Modal de Reserva
  reserveModal: "#reserve-modal",
  closeReserveModalBtn: "#close-reserve-modal-btn",
  reserveConfirmBtn: "#reserve-confirm-btn",
  reserveInputOs: "#reserve-input-os",
  reserveQuantityContainer: "#reserve-quantity-container",
  reserveInputQuantidade: "#reserve-input-quantidade",
  reserveAvailableText: "#reserve-available-text",
  
  // Modal de Itens Reservados
  reservedModal: "#reserved-modal",
  closeModalBtn: "#close-modal-btn",
  reservedModalContent: "#reserved-modal-content",
  modalLoader: "#modal-loader",
  osSearchInput: "#os-search-input",
  createPdfBtn: "#create-pdf-btn",
};

export const REQUIRED_REGISTER_FIELDS = [
  "reg-numero", "reg-gaveta", "reg-material", "reg-tipo", 
  "reg-espessura", "reg-comprimento", "reg-largura", "reg-quantidade"
];