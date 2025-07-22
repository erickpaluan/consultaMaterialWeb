// js/ui/dom.js
import { DOM_SELECTORS } from '../config.js';
import { createRetalhoTableRow, createRetalhoCard, createReservedItemsTable } from './components.js';

/**
 * Funções que manipulam diretamente o DOM.
 * Elas pegam os dados e os "desenham" na tela, mostram/escondem elementos, etc.
 */

// Atalho para querySelector
const get = (selector) => document.querySelector(selector);

export function renderRetalhos(retalhos) {
  const tableBody = get(DOM_SELECTORS.resultsTableBody);
  const cardsContainer = get(DOM_SELECTORS.resultsCardsContainer);
  
  tableBody.innerHTML = '';
  cardsContainer.innerHTML = '';

  const hasResults = retalhos.length > 0;
  get(DOM_SELECTORS.emptyState).classList.toggle('hidden', hasResults);
  get(DOM_SELECTORS.resultsContainer).classList.toggle('hidden', !hasResults);
  
  if (hasResults) {
    retalhos.forEach(retalho => {
      tableBody.appendChild(createRetalhoTableRow(retalho));
      cardsContainer.appendChild(createRetalhoCard(retalho));
    });
  }
}

export function populateSelect(selector, items, { defaultOption, valueKey, textKey, addOptions = [] }) {
    const select = get(selector);
    const currentValue = select.value;
    select.innerHTML = `<option value="">${defaultOption}</option>`;
    
    items.forEach(item => {
        const option = document.createElement('option');
        const value = valueKey ? item[valueKey] : item;
        const text = textKey ? item[textKey] : item;
        option.value = value;
        option.textContent = text;
        select.appendChild(option);
    });
    
    addOptions.forEach(opt => select.innerHTML += opt);

    if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
        select.value = currentValue;
    }
}

export function toggleLoader(isLoading) {
    get(DOM_SELECTORS.loader).classList.toggle('hidden', !isLoading);
}

export function updatePagination(currentPage, totalItems, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const controls = get(DOM_SELECTORS.paginationControls);
    
    controls.classList.toggle('hidden', totalPages <= 1);
    
    if (totalPages > 1) {
        get(DOM_SELECTORS.pageInfo).textContent = `Página ${currentPage} de ${totalPages}`;
        get(DOM_SELECTORS.prevPageBtn).disabled = currentPage === 1;
        get(DOM_SELECTORS.nextPageBtn).disabled = currentPage >= totalPages;
    }
}

export function toggleClearButtonVisibility(form) {
    const hasFilter = form.material.value || form.tipo.value || form.espessura.value || form.largura.value || form.altura.value;
    get(DOM_SELECTORS.clearBtn).classList.toggle('hidden', !hasFilter);
}

export function resetFilterForm(form) {
    form.reset();
    get(DOM_SELECTORS.tipoSelect).innerHTML = '<option value="">Todos os Tipos</option>';
    get(DOM_SELECTORS.espessuraSelect).innerHTML = '<option value="">Todas as Espessuras</option>';
    toggleClearButtonVisibility(form);
}

export function resetRegisterForm(form) {
    form.reset();
    get(DOM_SELECTORS.regNovoMaterialContainer).classList.add('hidden');
    get(DOM_SELECTORS.regNovoTipoContainer).classList.add('hidden');
    // Limpar mensagens de erro
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
}

export function renderReservedItems(data, container) {
    container.innerHTML = '';
    if(data.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 p-4">Nenhum retalho reservado encontrado.</p>`;
    } else {
        container.appendChild(createReservedItemsTable(data));
    }
}

export function updateSortVisuals(column, direction) {
    document.querySelectorAll(`${DOM_SELECTORS.resultsTable} th[data-sort]`).forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.sort === column) {
            th.classList.add(direction ? 'sort-asc' : 'sort-desc');
        }
    });
}

export function toggleSubmitButton(button, isSubmitting, text) {
    button.disabled = isSubmitting;
    button.querySelector('.reg-spinner').classList.toggle('hidden', !isSubmitting);
    button.querySelector('.reg-btn-text').textContent = isSubmitting ? 'Salvando...' : text;
}