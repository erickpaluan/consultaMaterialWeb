import { SELECTORS } from '../selectors.js';
import { createRetalhoTableRow, createRetalhoCard, createReservedItemsTable, createHistoryLog } from './components.js';

const get = (selector) => document.querySelector(selector);
const getAll = (selector) => document.querySelectorAll(selector);

// ==========================================================
// FUNÇÃO CORRIGIDA ABAIXO
// ==========================================================
export function renderRetalhos(retalhos) {
  const tableBody = get(SELECTORS.resultsTableBody);
  const cardsContainer = get(SELECTORS.resultsCardsContainer);
  if (!tableBody || !cardsContainer) return;

  // Limpa os resultados anteriores
  tableBody.innerHTML = '';
  cardsContainer.innerHTML = '';

  // Verifica se a lista de retalhos tem algum item
  const hasResults = retalhos && retalhos.length > 0;

  // LÓGICA DE VISIBILIDADE SINCRONIZADA
  // 1. Se 'hasResults' for verdadeiro, a classe 'hidden' é ADICIONADA à mensagem de "vazio" (escondendo-a).
  //    Se for falso, a classe 'hidden' é REMOVIDA (mostrando-a).
  get(SELECTORS.emptyState).classList.toggle('hidden', hasResults);

  // 2. A lógica aqui é invertida com '!'. Se 'hasResults' for verdadeiro, a classe 'hidden' é REMOVIDA do container de resultados (mostrando-o).
  //    Se for falso, a classe 'hidden' é ADICIONADA (escondendo-o).
  get(SELECTORS.resultsContainer).classList.toggle('hidden', !hasResults);
  
  // Se houver resultados, preenche o grid/tabela
  if (hasResults) {
    retalhos.forEach(retalho => {
      tableBody.appendChild(createRetalhoTableRow(retalho));
      cardsContainer.appendChild(createRetalhoCard(retalho));
    });
  }
}
// ==========================================================
// FIM DA CORREÇÃO
// ==========================================================

export function populateSelect(selectElement, items, { defaultOption, textKey, valueKey, addOptions = [] }) {
    if (!selectElement) return;
    const currentValue = selectElement.value;
    selectElement.innerHTML = `<option value="">${defaultOption}</option>`;
    items.forEach(item => {
        const option = document.createElement('option');
        const value = valueKey ? item[valueKey] : item;
        const text = textKey ? item[textKey] : item;
        option.value = value;
        option.textContent = text;
        selectElement.appendChild(option);
    });
    addOptions.forEach(opt => selectElement.innerHTML += opt);
    if (currentValue && Array.from(selectElement.options).some(opt => opt.value === currentValue)) {
        selectElement.value = currentValue;
    }
}

export function toggleLoader(isLoading) {
    get(SELECTORS.loader).classList.toggle('hidden', !isLoading);
}

export function updatePagination(currentPage, totalItems, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationControls = get(SELECTORS.paginationControls);
    if (!paginationControls) return;

    paginationControls.classList.toggle('hidden', totalPages <= 1);
    
    if (totalPages > 1) {
        get(SELECTORS.pageInfo).textContent = `Página ${currentPage} de ${totalPages}`;
        get(SELECTORS.prevPageBtn).disabled = currentPage === 1;
        get(SELECTORS.nextPageBtn).disabled = currentPage >= totalPages;
    }
}

export function toggleClearButtonVisibility() {
    const form = get(SELECTORS.filterForm);
    if (!form) return;
    const smartSearch = get(SELECTORS.smartSearchInput);
    const hasFilter = form.elements.material.value || form.elements.tipo.value || form.elements.espessura.value || form.elements.largura.value || form.elements.altura.value || (smartSearch && smartSearch.value);
    get(SELECTORS.clearBtn).classList.toggle('hidden', !hasFilter);
}

export function resetFilterForm() {
    get(SELECTORS.filterForm)?.reset();
    const smartSearchInput = get(SELECTORS.smartSearchInput);
    if(smartSearchInput) smartSearchInput.value = '';

    const tipoSelect = get(SELECTORS.tipoSelect);
    if(tipoSelect) tipoSelect.innerHTML = '<option value="">Todos os Tipos</option>';
    
    const espessuraSelect = get(SELECTORS.espessuraSelect);
    if(espessuraSelect) espessuraSelect.innerHTML = '<option value="">Todas as Espessuras</option>';
    
    toggleClearButtonVisibility();
}

export function resetRegisterForm() {
    const form = get(SELECTORS.registerForm);
    if (!form) return;
    form.reset();
    get(SELECTORS.regNovoMaterialContainer).classList.add('hidden');
    get(SELECTORS.regNovoTipoContainer).classList.add('hidden');
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));
}

export function renderReservedItems(data) {
    const container = get(SELECTORS.reservedModalContent);
    if (!container) return;
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
    if (!button) return;
    button.disabled = isSubmitting;
    
    const spinnerElement = button.querySelector(SELECTORS.regSpinner);
    if (spinnerElement) {
        spinnerElement.classList.toggle('hidden', !isSubmitting);
    }
    
    const textElement = button.querySelector(SELECTORS.regSubmitBtnText);
    if (textElement) {
        textElement.textContent = text;
    }
}

export function renderAuditoria(logs) {
    const container = get(SELECTORS.historyModalContent);
    if (container) {
        container.innerHTML = createHistoryLog(logs);
    }
}