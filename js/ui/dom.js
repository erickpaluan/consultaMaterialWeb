import { SELECTORS } from './selectors.js';
import { createRetalhoTableRow, createRetalhoCard, createReservedItemsTable, createHistoryLog } from './components.js';

const get = (selector) => document.querySelector(selector);
const getAll = (selector) => document.querySelectorAll(selector);

export function renderRetalhos(retalhos) {
  get(SELECTORS.resultsTableBody).innerHTML = '';
  get(SELECTORS.resultsCardsContainer).innerHTML = '';
  const hasResults = retalhos.length > 0;
  get(SELECTORS.emptyState).classList.toggle('hidden', hasResults);
  get(SELECTORS.resultsContainer).classList.toggle('hidden', !hasResults);
  
  if (hasResults) {
    retalhos.forEach(retalho => {
      get(SELECTORS.resultsTableBody).appendChild(createRetalhoTableRow(retalho));
      get(SELECTORS.resultsCardsContainer).appendChild(createRetalhoCard(retalho));
    });
  }
}

export function populateSelect(selectElement, items, { defaultOption, textKey, valueKey, addOptions = [] }) { /* ...código sem alteração... */ }
export function toggleLoader(isLoading) { get(SELECTORS.loader).classList.toggle('hidden', !isLoading); }

export function updatePagination(currentPage, totalItems, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    get(SELECTORS.paginationControls).classList.toggle('hidden', totalPages <= 1);
    if (totalPages > 1) {
        get(SELECTORS.pageInfo).textContent = `Página ${currentPage} de ${totalPages}`;
        get(SELECTORS.prevPageBtn).disabled = currentPage === 1;
        get(SELECTORS.nextPageBtn).disabled = currentPage >= totalPages;
    }
}

export function toggleClearButtonVisibility() {
    const form = get(SELECTORS.filterForm);
    const hasFilter = form.elements.material.value || form.elements.tipo.value || form.elements.espessura.value || form.elements.largura.value || form.elements.altura.value || get(SELECTORS.smartSearchInput).value;
    get(SELECTORS.clearBtn).classList.toggle('hidden', !hasFilter);
}

export function resetFilterForm() {
    get(SELECTORS.filterForm).reset();
    get(SELECTORS.smartSearchInput).value = '';
    get(SELECTORS.tipoSelect).innerHTML = '<option value="">Todos os Tipos</option>';
    get(SELECTORS.espessuraSelect).innerHTML = '<option value="">Todas as Espessuras</option>';
    toggleClearButtonVisibility();
}

export function resetRegisterForm() {
    const form = get(SELECTORS.registerForm);
    form.reset();
    get(SELECTORS.regNovoMaterialContainer).classList.add('hidden');
    get(SELECTORS.regNovoTipoContainer).classList.add('hidden');
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));
}

export function renderReservedItems(data) {
    const container = get(SELECTORS.reservedModalContent);
    container.innerHTML = '';
    if(!data || data.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 p-4">Nenhum retalho reservado encontrado.</p>`;
    } else {
        container.appendChild(createReservedItemsTable(data));
    }
}

export function updateSortVisuals(column, direction) {
    getAll(`${SELECTORS.resultsTable} th[data-sort]`).forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.sort === column) {
            th.classList.add(direction ? 'sort-asc' : 'sort-desc');
        }
    });
}

export function toggleSubmitButton(button, isSubmitting, text) {
    button.disabled = isSubmitting;
    button.querySelector('.reg-spinner').classList.toggle('hidden', !isSubmitting);
    button.querySelector('.reg-btn-text').textContent = text;
}

export function renderAuditoria(logs) {
    get(SELECTORS.historyModalContent).innerHTML = createHistoryLog(logs);
}