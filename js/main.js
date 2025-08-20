import { SELECTORS } from './selectors.js';
import * as handlers from './handlers.js';
import { openModal, closeModal } from './ui/modals.js';
import { initializeAuth } from './session.js';
import { AUTO_REFRESH_INTERVAL } from './config.js';

const get = (selector) => document.querySelector(selector);
let isAppInitialized = false;

export function initializeApp() {
  if (isAppInitialized) return;
  console.log("Inicializando a aplicação principal...");

  get(SELECTORS.smartSearchInput).addEventListener('input', handlers.debouncedSmartSearch);
  get(SELECTORS.filterForm).addEventListener('submit', (e) => e.preventDefault());
  get(SELECTORS.materialSelect).addEventListener('change', handlers.handleFilterFormChange);
  get(SELECTORS.tipoSelect).addEventListener('change', handlers.handleFilterFormChange);
  get(SELECTORS.filterForm).querySelectorAll('input').forEach(input => {
    input.addEventListener('input', handlers.handleFilterFormChange);
  });
  get(SELECTORS.clearBtn).addEventListener('click', handlers.handleClearFilters);
  get(SELECTORS.prevPageBtn).addEventListener('click', () => handlers.handlePageChange(-1));
  get(SELECTORS.nextPageBtn).addEventListener('click', () => handlers.handlePageChange(1));
  get(SELECTORS.resultsTable).addEventListener('click', handlers.handleSort);
  get(SELECTORS.openRegisterModalBtn).addEventListener('click', handlers.handleOpenRegisterModal);
  get(SELECTORS.showReservedBtn).addEventListener('click', () => handlers.handleFetchReservedItems());
  
  get(SELECTORS.resultsContainer).addEventListener('click', (e) => {
    if (e.target.closest('.edit-btn')) handlers.handleOpenEditModal(e);
    if (e.target.closest('.reserve-btn')) handlers.handleReserveClick(e);
    if (e.target.closest('.history-btn')) handlers.handleOpenHistoryModal(e);
    if (e.target.closest('.delete-btn')) handlers.handleDeleteRetalho(e);
  });

  const form = get(SELECTORS.registerForm);
  get(SELECTORS.closeRegisterModalBtn).addEventListener('click', () => closeModal(get(SELECTORS.registerModal)));
  get(SELECTORS.regSubmitBtn).addEventListener('click', handlers.handleRegisterSubmit);
  form.elements['reg-material'].addEventListener('change', handlers.handleMaterialCadastroChange);
  form.elements['reg-tipo'].addEventListener('change', handlers.handleTipoCadastroChange);
  get(SELECTORS.regSalvarNovoMaterialBtn).addEventListener('click', handlers.handleSalvarNovoMaterial);
  get(SELECTORS.regSalvarNovoTipoBtn).addEventListener('click', handlers.handleSalvarNovoTipo);
  get(SELECTORS.regCancelarNovoMaterialBtn).addEventListener('click', () => get(SELECTORS.regNovoMaterialContainer).classList.add('hidden'));
  get(SELECTORS.regCancelarNovoTipoBtn).addEventListener('click', () => get(SELECTORS.regNovoTipoContainer).classList.add('hidden'));
  get(SELECTORS.regClearBtn).addEventListener('click', handlers.handleClearRegisterForm);
  
  get(SELECTORS.closeReserveModalBtn).addEventListener('click', () => closeModal(get(SELECTORS.reserveModal)));
  get(SELECTORS.reserveConfirmBtn).addEventListener('click', handlers.handleConfirmReserve);
  
  get(SELECTORS.reservedModalContent).addEventListener('click', (e) => {
      if (e.target.closest('.cancel-btn')) handlers.handleCancelReserve(e);
      if (e.target.closest('.baixa-btn')) handlers.handleBaixaRetalho(e);
  });
  get(SELECTORS.closeModalBtn).addEventListener('click', () => closeModal(get(SELECTORS.reservedModal)));
  get(SELECTORS.osSearchInput).addEventListener('input', handlers.handleSearchReserved);
  get(SELECTORS.createPdfBtn).addEventListener('click', handlers.handleGeneratePdf);
  
  get(SELECTORS.closeHistoryModalBtn).addEventListener('click', () => closeModal(get(SELECTORS.historyModal)));

  [SELECTORS.registerModal, SELECTORS.reserveModal, SELECTORS.reservedModal, SELECTORS.historyModal].forEach(selector => {
    const modal = get(selector);
    if (modal) {
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) closeModal(modal);
        });
    }
  });

  setInterval(handlers.handleLoadFilterOptions, AUTO_REFRESH_INTERVAL);
  window.addEventListener('focus', handlers.handleLoadFilterOptions);

  handlers.handleLoadFilterOptions();
  handlers.handleLoadRetalhos();
  isAppInitialized = true;
}

document.addEventListener('DOMContentLoaded', initializeAuth);