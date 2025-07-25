import { ui } from '../uiElements.js';
import { createRetalhoTableRow, createRetalhoCard, createReservedItemsTable, createHistoryLog } from './components.js';
import { getState } from '../state.js'; 

export function renderRetalhos(retalhos) {

    const { currentUser } = getState();
    const userRole = currentUser?.role;
  ui.resultsTableBody.innerHTML = '';
  ui.resultsCardsContainer.innerHTML = '';

  const hasResults = retalhos.length > 0;
  ui.emptyState.classList.toggle('hidden', hasResults);
  ui.resultsContainer.classList.toggle('hidden', !hasResults);
  
  if (hasResults) {
    retalhos.forEach(retalho => {
      ui.resultsTableBody.appendChild(createRetalhoTableRow(retalho, userRole));
      ui.resultsCardsContainer.appendChild(createRetalhoCard(retalho, userRole));
    });
  }
}

export function renderAuditoria(logs) {
    ui.historyModalContent.innerHTML = createHistoryLog(logs);
}

export function populateSelect(selectElement, items, { defaultOption, textKey, valueKey, addOptions = [] }) {
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
    ui.loader.classList.toggle('hidden', !isLoading);
}

export function updatePagination(currentPage, totalItems, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    ui.paginationControls.classList.toggle('hidden', totalPages <= 1);
    
    if (totalPages > 1) {
        ui.pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        ui.prevPageBtn.disabled = currentPage === 1;
        ui.nextPageBtn.disabled = currentPage >= totalPages;
    }
}

export function toggleClearButtonVisibility() {
    const formElements = ui.filterForm.elements;
    const hasFilter = formElements.material.value || formElements.tipo.value || formElements.espessura.value || formElements.largura.value || formElements.altura.value;
    ui.clearBtn.classList.toggle('hidden', !hasFilter);
}

export function resetFilterForm() {
    ui.filterForm.reset();
    ui.tipoSelect.innerHTML = '<option value="">Todos os Tipos</option>';
    ui.espessuraSelect.innerHTML = '<option value="">Todas as Espessuras</option>';
    toggleClearButtonVisibility();
}

export function resetRegisterForm() {
    ui.registerForm.reset();
    ui.regNovoMaterialContainer.classList.add('hidden');
    ui.regNovoTipoContainer.classList.add('hidden');
    ui.registerForm.querySelectorAll('.error-message').forEach(el => el.remove());
    ui.registerForm.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
}

export function renderReservedItems(data) {
    ui.reservedModalContent.innerHTML = '';
    if(data.length === 0) {
        ui.reservedModalContent.innerHTML = `<p class="text-center text-gray-500 p-4">Nenhum retalho reservado encontrado.</p>`;
    } else {
        ui.reservedModalContent.appendChild(createReservedItemsTable(data));
    }
}

export function updateSortVisuals(column, direction) {
    ui.resultsTable.querySelectorAll('th[data-sort]').forEach(th => {
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