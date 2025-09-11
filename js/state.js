import { DEFAULT_ITEMS_PER_PAGE } from "./config.js";

const appState = {
  retalhos: [],
  currentPage: 1,
  totalItems: 0,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  sort: { column: "numero", direction: true },
  filters: {
    material: "",
    tipo: "",
    espessura: "",
    largura: "",
    altura: "",
    textSearch: [],
  },
  isLoading: false,
  currentRetalhoToReserve: { id: null, quantidadeDisponivel: 0 },
  existingMaterials: [],
  existingTypes: [],
  currentUser: null,
};

export const getState = () => appState;
export const setState = (newState) => {
  Object.assign(appState, newState);
};

export const updateFilters = (form) => {
  appState.filters.material = form.elements.material.value;
  appState.filters.tipo = form.elements.tipo.value;
  appState.filters.espessura = form.elements.espessura.value;
  appState.filters.largura = form.elements.largura.value;
  appState.filters.altura = form.elements.altura.value;
  appState.filters.textSearch = [];
  appState.currentPage = 1;
};

export const resetFilters = () => {
  appState.filters = {
    material: "",
    tipo: "",
    espessura: "",
    largura: "",
    altura: "",
    textSearch: [],
  };
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
