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
import { DEFAULT_ITEMS_PER_PAGE } from "./config.js";
import { debounce } from "./utils.js";

const get = (selector) => document.querySelector(selector);
let currentRetalhoToEdit = null;

export function handleItemsPerPageChange(event) {
  const newItemsPerPage = parseInt(event.target.value, 10);
  setState({
    itemsPerPage: newItemsPerPage,
    currentPage: 1,
  });
  handleLoadRetalhos();
}

async function handleLoadRetalhos() {
  dom.toggleLoader(true);
  const state = getState();
  const pagination = {
    currentPage: state.currentPage,
    itemsPerPage: state.itemsPerPage,
  };
  const { data, error, count } = await api.fetchRetalhos(
    state.filters,
    pagination,
    state.sort
  );
  if (error) {
    console.error("Erro ao carregar retalhos:", error);
    Swal.fire("Erro", "Não foi possível carregar os retalhos.", "error");
  } else {
    setState({ totalItems: count });
    dom.renderRetalhos(data || []);
    dom.updatePagination(state.currentPage, count, state.itemsPerPage);
  }
  dom.toggleLoader(false);
}

function handlePageChange(direction) {
  const state = getState();
  const totalPages =
    state.itemsPerPage === -1
      ? 1
      : Math.ceil(state.totalItems / state.itemsPerPage);
  let newPage = state.currentPage + direction;
  if (newPage >= 1 && newPage <= totalPages) {
    setState({ currentPage: newPage });
    handleLoadRetalhos();
  }
}

// --- O resto do arquivo handlers.js permanece o mesmo ---
export const debouncedSmartSearch = debounce(handleSmartSearch, 500);
function parseSearchQuery(query) {
  /* ... */
}
function handleSmartSearch() {
  /* ... */
}
function validateRegisterForm() {
  /* ... */
}
function handleFilterFormChange() {
  /* ... */
}
function handleClearFilters() {
  /* ... */
}
function handleSort(event) {
  /* ... */
}
async function handleLoadFilterOptions() {
  /* ... */
}
async function handleLoadTiposParaFiltro() {
  /* ... */
}
async function handleLoadEspessurasParaFiltro() {
  /* ... */
}
async function setupRegisterModal(mode = "add", retalhoData = null) {
  /* ... */
}
async function handleOpenRegisterModal() {
  await setupRegisterModal("add");
}
async function handleOpenEditModal(event) {
  /* ... */
}
async function handleMaterialCadastroChange() {
  /* ... */
}
function handleTipoCadastroChange() {
  /* ... */
}
function addAndSelectOption(selectElement, value) {
  /* ... */
}
function handleSalvarNovoMaterial() {
  /* ... */
}
function handleSalvarNovoTipo() {
  /* ... */
}
function handleClearRegisterForm() {
  /* ... */
}
async function handleRegisterSubmit() {
  /* ... */
}
function handleReserveClick(event) {
  /* ... */
}
async function handleConfirmReserve() {
  /* ... */
}
async function handleOpenHistoryModal(event) {
  /* ... */
}
const debouncedSearchReserved = debounce(
  (term) => handleFetchReservedItems(term),
  400
);
function handleSearchReserved(event) {
  debouncedSearchReserved(event.target.value);
}
async function handleFetchReservedItems(searchTerm = "") {
  /* ... */
}
async function handleCancelReserve(event) {
  /* ... */
}
function handleGeneratePdf() {
  /* ... */
}
async function handleDeleteRetalho(event) {
  /* ... */
}
async function handleBaixaRetalho(event) {
  /* ... */
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
