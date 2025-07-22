// js/main.js
import { DOM_SELECTORS, AUTO_REFRESH_INTERVAL } from './config.js';
import * as handlers from './handlers.js';
import { openModal, closeModal } from './ui/modals.js';
import { resetRegisterForm } from './ui/dom.js';

/**
 * Ponto de entrada da aplicação (Entrypoint).
 * Responsável por inicializar os event listeners e carregar os dados iniciais.
 */

// Atalho para querySelector
const get = (selector) => document.querySelector(selector);

function initializeEventListeners() {
  // Filtros da consulta principal
  get(DOM_SELECTORS.filterForm).addEventListener('submit', (e) => e.preventDefault());
  get(DOM_SELECTORS.materialSelect).addEventListener('change', handlers.handleLoadTiposParaFiltro);
  get(DOM_SELECTORS.tipoSelect).addEventListener('change', handlers.handleLoadEspessurasParaFiltro);
  
  // Dispara a busca em qualquer mudança nos filtros
  const filterInputs = [DOM_SELECTORS.materialSelect, DOM_SELECTORS.tipoSelect, DOM_SELECTORS.espessuraSelect, DOM_SELECTORS.larguraInput, DOM_SELECTORS.alturaInput];
  filterInputs.forEach(selector => get(selector).addEventListener('change', handlers.handleFilterFormChange));
  get(DOM_SELECTORS.larguraInput).addEventListener('keyup', handlers.handleFilterFormChange);
  get(DOM_SELECTORS.alturaInput).addEventListener('keyup', handlers.handleFilterFormChange);

  get(DOM_SELECTORS.clearBtn).addEventListener('click', handlers.handleClearFilters);
  
  // Paginação
  get(DOM_SELECTORS.prevPageBtn).addEventListener('click', () => handlers.handlePageChange(-1));
  get(DOM_SELECTORS.nextPageBtn).addEventListener('click', () => handlers.handlePageChange(1));

  // Ordenação da Tabela
  get(DOM_SELECTORS.resultsTable).addEventListener('click', handlers.handleSort);

  // Botões de Ação e Modais
  get(DOM_SELECTORS.openRegisterModalBtn).addEventListener('click', () => openModal(get(DOM_SELECTORS.registerModal)));
  get(DOM_SELECTORS.showReservedBtn).addEventListener('click', () => handlers.handleFetchReservedItems());
  
  // Modal de Cadastro
  const registerModal = get(DOM_SELECTORS.registerModal);
  get(DOM_SELECTORS.closeRegisterModalBtn).addEventListener('click', () => closeModal(registerModal));
  get(DOM_SELECTORS.registerForm).addEventListener('submit', handlers.handleRegisterSubmit);
  get(DOM_SELECTORS.regClearBtn).addEventListener('click', () => resetRegisterForm(get(DOM_SELECTORS.registerForm)));

  // Modal de Reserva
  const reserveModal = get(DOM_SELECTORS.reserveModal);
  get(DOM_SELECTORS.resultsContainer).addEventListener('click', handlers.handleReserveClick);
  get(DOM_SELECTORS.closeReserveModalBtn).addEventListener('click', () => closeModal(reserveModal));
  get(DOM_SELECTORS.reserveConfirmBtn).addEventListener('click', handlers.handleConfirmReserve);
  
  // Modal de Reservados
  const reservedModal = get(DOM_SELECTORS.reservedModal);
  get(DOM_SELECTORS.closeModalBtn).addEventListener('click', () => closeModal(reservedModal));
  get(DOM_SELECTORS.osSearchInput).addEventListener('input', handlers.handleSearchReserved);
  get(DOM_SELECTORS.reservedModalContent).addEventListener('click', handlers.handleCancelReserve);
  get(DOM_SELECTORS.createPdfBtn).addEventListener('click', handlers.handleGeneratePdf);

  // Fechar modais ao clicar fora
  [registerModal, reserveModal, reservedModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
  });

  // Atualização automática
  setInterval(handlers.handleLoadFilterOptions, AUTO_REFRESH_INTERVAL);
  window.addEventListener('focus', handlers.handleLoadFilterOptions);
}

function initialLoad() {
  handlers.handleLoadFilterOptions();
  handlers.handleLoadRetalhos();
}

// Inicia a aplicação quando o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', () => {
  console.log("Aplicação iniciada.");
  initializeEventListeners();
  initialLoad();
});