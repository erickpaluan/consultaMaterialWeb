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
    input.addEventListener('input', handlers.handleFilterFormChange);
  });
  ui.clearBtn.addEventListener('click', handlers.handleClearFilters);

  // Paginação e Ordenação
  ui.prevPageBtn.addEventListener('click', () => handlers.handlePageChange(-1));
  ui.nextPageBtn.addEventListener('click', () => handlers.handlePageChange(1));
  ui.resultsTable.addEventListener('click', handlers.handleSort);

  // Ações e Modais Globais
  ui.openRegisterModalBtn.addEventListener('click', handlers.handleOpenRegisterModal);
  ui.showReservedBtn.addEventListener('click', () => handlers.handleFetchReservedItems());
  
  // Ações nos itens (Editar, Reservar e Histórico)
  ui.resultsContainer.addEventListener('click', (e) => {
    if (e.target.closest('.edit-btn')) handlers.handleOpenEditModal(e);
    if (e.target.closest('.reserve-btn')) handlers.handleReserveClick(e);
    if (e.target.closest('.history-btn')) handlers.handleOpenHistoryModal(e);
  });

  // Modal de Cadastro/Edição
  ui.closeRegisterModalBtn.addEventListener('click', () => closeModal(ui.registerModal));
  ui.regSubmitBtn.addEventListener('click', handlers.handleRegisterSubmit);
  ui.regMaterialSelect.addEventListener('change', handlers.handleMaterialCadastroChange);
  ui.regTipoSelect.addEventListener('change', handlers.handleTipoCadastroChange);
  ui.regSalvarNovoMaterialBtn.addEventListener('click', handlers.handleSalvarNovoMaterial);
  ui.regSalvarNovoTipoBtn.addEventListener('click', handlers.handleSalvarNovoTipo);
  ui.regCancelarNovoMaterialBtn.addEventListener('click', () => ui.regNovoMaterialContainer.classList.add('hidden'));
  ui.regCancelarNovoTipoBtn.addEventListener('click', () => ui.regNovoTipoContainer.classList.add('hidden'));
  ui.regClearBtn.addEventListener('click', handlers.handleClearRegisterForm);

  // Modal de Reserva
  ui.closeReserveModalBtn.addEventListener('click', () => closeModal(ui.reserveModal));
  ui.reserveConfirmBtn.addEventListener('click', handlers.handleConfirmReserve);
  
  // Modal de Itens Reservados
  ui.closeModalBtn.addEventListener('click', () => closeModal(ui.reservedModal));
  ui.osSearchInput.addEventListener('input', handlers.handleSearchReserved);
  ui.reservedModalContent.addEventListener('click', handlers.handleCancelReserve);
  ui.createPdfBtn.addEventListener('click', handlers.handleGeneratePdf);

  // Modal de Histórico
  ui.closeHistoryModalBtn.addEventListener('click', () => closeModal(ui.historyModal));

  // Lógica para fechar modais ao clicar fora (no fundo escuro)
  [ui.registerModal, ui.reserveModal, ui.reservedModal, ui.historyModal].forEach(modal => {
    modal.addEventListener('click', (e) => { 
        // O e.target precisa ser exatamente o elemento de fundo para fechar
        if (e.target === modal) {
            closeModal(modal);
        }
    });
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