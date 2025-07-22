import { ui } from './uiElements.js';

const appState = {
  retalhos: [],
  currentPage: 1,
  totalItems: 0,
  sort: { column: "numero", direction: true },
  filters: { material: "", tipo: "", espessura: "", largura: "", altura: "" },
  isLoading: false,
  currentRetalhoToReserve: { id: null, quantidadeDisponivel: 0 },
  existingMaterials: [],
  existingTypes: [],
};

export const getState = () => appState;
export const setState = (newState) => { Object.assign(appState, newState); };

export const updateFilters = () => {
    const formElements = ui.filterForm.elements;
    appState.filters.material = formElements.material.value;
    appState.filters.tipo = formElements.tipo.value;
    appState.filters.espessura = formElements.espessura.value;
    appState.filters.largura = formElements.largura.value;
    appState.filters.altura = formElements.altura.value;
    appState.currentPage = 1;
};

export const resetFilters = () => {
    appState.filters = { material: "", tipo: "", espessura: "", largura: "", altura: "" };
    appState.currentPage = 1;
};

export const setSort = (newSortColumn) => {
    if (appState.sort.column === newSortColumn) {
        appState.sort.direction = !appState.sort.direction;
    } else {
        appState.sort.column = newSortColumn;
        appState.sort.direction = true;
    }
    appState.currentPage = 1;
};