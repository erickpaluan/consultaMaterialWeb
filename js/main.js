import { ui } from './uiElements.js';
import * as handlers from './handlers.js';
import { openModal, closeModal } from './ui/modals.js';
import { initializeAuth } from './session.js';
import { AUTO_REFRESH_INTERVAL } from './config.js';

let isAppInitialized = false;

export function initializeApp() {
  if (isAppInitialized) return;
  console.log("Inicializando a aplicação principal...");

  // Listeners de Filtros
  ui.filterForm.addEventListener('submit', (e) => e.preventDefault());
  ui.materialSelect.addEventListener('change', handlers.handleLoadTiposParaFiltro);
  ui.tipoSelect.addEventListener('change', handlers.handleLoadEspessurasParaFiltro);
  const filterInputs = ui.filterForm.querySelectorAll('select, input');
  filterInputs.forEach(input => {
    input.addEventListener('change', handlers.handleFilterFormChange);
    if (input.type === 'number') input.addEventListener('keyup', handlers.handleFilterFormChange);
  });
  ui.clearBtn.addEventListener('click', handlers.handleClearFilters);

  // Paginação e Ordenação
  ui.prevPageBtn.addEventListener('click', () => handlers.handlePageChange(-1));
  ui.nextPageBtn.addEventListener('click', () => handlers.handlePageChange(1));
  ui.resultsTable.addEventListener('click', handlers.handleSort);

  // Ações e Modais Globais
  ui.openRegisterModalBtn.addEventListener('click', handlers.handleOpenRegisterModal);
  ui.showReservedBtn.addEventListener('click', () => handlers.handleFetchReservedItems());
  
  // Listeners do Modal de CADASTRO (Corrigido e com novas adições)
  ui.closeRegisterModalBtn.addEventListener('click', () => closeModal(ui.registerModal));
  ui.registerForm.addEventListener('submit', handlers.handleRegisterSubmit);
  ui.regMaterialSelect.addEventListener('change', handlers.handleMaterialCadastroChange);
  ui.regTipoSelect.addEventListener('change', handlers.handleTipoCadastroChange);
  ui.regSalvarNovoMaterialBtn.addEventListener('click', handlers.handleSalvarNovoMaterial);
  ui.regSalvarNovoTipoBtn.addEventListener('click', handlers.handleSalvarNovoTipo);
  ui.regClearBtn.addEventListener('click', handlers.handleClearRegisterForm);

  // Listeners do Modal de RESERVA
  ui.resultsContainer.addEventListener('click', handlers.handleReserveClick);
  ui.closeReserveModalBtn.addEventListener('click', () => closeModal(ui.reserveModal));
  ui.reserveConfirmBtn.addEventListener('click', handlers.handleConfirmReserve);
  
  // Listeners do Modal de ITENS RESERVADOS
  ui.closeModalBtn.addEventListener('click', () => closeModal(ui.reservedModal));
  ui.osSearchInput.addEventListener('input', handlers.handleSearchReserved);
  ui.reservedModalContent.addEventListener('click', handlers.handleCancelReserve);
  ui.createPdfBtn.addEventListener('click', handlers.handleGeneratePdf);

  // Lógica para fechar modais ao clicar fora
  [ui.registerModal, ui.reserveModal, ui.reservedModal].forEach(modal => {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  });

  // Atualização automática
  setInterval(handlers.handleLoadFilterOptions, AUTO_REFRESH_INTERVAL);
  window.addEventListener('focus', handlers.handleLoadFilterOptions);

  // Carga de dados inicial da aplicação
  handlers.handleLoadFilterOptions();
  handlers.handleLoadRetalhos();

  isAppInitialized = true;
}

// Ponto de entrada da aplicação
document.addEventListener('DOMContentLoaded', initializeAuth);