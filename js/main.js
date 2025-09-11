import { SELECTORS } from "./selectors.js";
import * as handlers from "./handlers.js";
import { openModal, closeModal } from "./ui/modals.js";
import { initializeAuth } from "./session.js";
import { AUTO_REFRESH_INTERVAL } from "./config.js";

const get = (selector) => document.querySelector(selector);
let isAppInitialized = false;

// Função auxiliar para adicionar listeners de forma segura
const addListener = (selector, event, handler) => {
  const element = get(selector);
  if (element) {
    element.addEventListener(event, handler);
  } else {
    console.warn(`Elemento não encontrado para o seletor: ${selector}`);
  }
};

export function initializeApp() {
  if (isAppInitialized) return;
  console.log("Inicializando a aplicação principal...");

  // Usando a função auxiliar para mais segurança
  addListener(
    SELECTORS.smartSearchInput,
    "input",
    handlers.debouncedSmartSearch
  );
  addListener(SELECTORS.filterForm, "submit", (e) => e.preventDefault());
  addListener(
    SELECTORS.materialSelect,
    "change",
    handlers.handleFilterFormChange
  );
  addListener(SELECTORS.tipoSelect, "change", handlers.handleFilterFormChange);

  const filterForm = get(SELECTORS.filterForm);
  if (filterForm) {
    filterForm.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", handlers.handleFilterFormChange);
    });
  }

  addListener(SELECTORS.clearBtn, "click", handlers.handleClearFilters);
  addListener(SELECTORS.prevPageBtn, "click", () =>
    handlers.handlePageChange(-1)
  );
  addListener(SELECTORS.nextPageBtn, "click", () =>
    handlers.handlePageChange(1)
  );
  addListener(SELECTORS.resultsTable, "click", handlers.handleSort);
  addListener(
    SELECTORS.openRegisterModalBtn,
    "click",
    handlers.handleOpenRegisterModal
  );
  addListener(SELECTORS.showReservedBtn, "click", () =>
    handlers.handleFetchReservedItems()
  );

  addListener(SELECTORS.resultsContainer, "click", (e) => {
    if (e.target.closest(".edit-btn")) handlers.handleOpenEditModal(e);
    if (e.target.closest(".reserve-btn")) handlers.handleReserveClick(e);
    if (e.target.closest(".history-btn")) handlers.handleOpenHistoryModal(e);
    if (e.target.closest(".delete-btn")) handlers.handleDeleteRetalho(e);
  });

  const regForm = get(SELECTORS.registerForm);
  if (regForm) {
    addListener(SELECTORS.closeRegisterModalBtn, "click", () =>
      closeModal(get(SELECTORS.registerModal))
    );
    addListener(SELECTORS.regSubmitBtn, "click", handlers.handleRegisterSubmit);
    regForm.elements["reg-material"]?.addEventListener(
      "change",
      handlers.handleMaterialCadastroChange
    );
    regForm.elements["reg-tipo"]?.addEventListener(
      "change",
      handlers.handleTipoCadastroChange
    );
    addListener(
      SELECTORS.regSalvarNovoMaterialBtn,
      "click",
      handlers.handleSalvarNovoMaterial
    );
    addListener(
      SELECTORS.regSalvarNovoTipoBtn,
      "click",
      handlers.handleSalvarNovoTipo
    );
    addListener(SELECTORS.regCancelarNovoMaterialBtn, "click", () =>
      get(SELECTORS.regNovoMaterialContainer).classList.add("hidden")
    );
    addListener(SELECTORS.regCancelarNovoTipoBtn, "click", () =>
      get(SELECTORS.regNovoTipoContainer).classList.add("hidden")
    );
    addListener(
      SELECTORS.regClearBtn,
      "click",
      handlers.handleClearRegisterForm
    );
  }

  addListener(SELECTORS.closeReserveModalBtn, "click", () =>
    closeModal(get(SELECTORS.reserveModal))
  );
  addListener(
    SELECTORS.reserveConfirmBtn,
    "click",
    handlers.handleConfirmReserve
  );

  addListener(SELECTORS.reservedModalContent, "click", (e) => {
    if (e.target.closest(".cancel-btn")) handlers.handleCancelReserve(e);
    if (e.target.closest(".baixa-btn")) handlers.handleBaixaRetalho(e);
  });
  addListener(SELECTORS.closeModalBtn, "click", () =>
    closeModal(get(SELECTORS.reservedModal))
  );
  addListener(SELECTORS.osSearchInput, "input", handlers.handleSearchReserved);
  addListener(SELECTORS.createPdfBtn, "click", handlers.handleGeneratePdf);

  addListener(SELECTORS.closeHistoryModalBtn, "click", () =>
    closeModal(get(SELECTORS.historyModal))
  );

  [
    SELECTORS.registerModal,
    SELECTORS.reserveModal,
    SELECTORS.reservedModal,
    SELECTORS.historyModal,
  ].forEach((selector) => {
    const modal = get(selector);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  setInterval(handlers.handleLoadFilterOptions, AUTO_REFRESH_INTERVAL);
  window.addEventListener("focus", handlers.handleLoadFilterOptions);

  handlers.handleLoadFilterOptions();
  handlers.handleLoadRetalhos();
  isAppInitialized = true;
}

document.addEventListener("DOMContentLoaded", initializeAuth);
