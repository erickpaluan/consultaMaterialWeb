// js/state.js

/**
 * Gerencia o estado da aplicação de forma centralizada.
 * Isso evita variáveis globais espalhadas e torna o fluxo de dados previsível.
 */

const appState = {
  // Estado da consulta principal
  retalhos: [],
  currentPage: 1,
  totalItems: 0,
  sort: {
    column: "numero",
    direction: true, // true para 'asc', false para 'desc'
  },
  filters: {
    material: "",
    tipo: "",
    espessura: "",
    largura: "",
    altura: "",
  },
  isLoading: false,

  // Estado para os modais
  currentRetalhoToReserve: {
    id: null,
    quantidadeDisponivel: 0,
  },
  existingMaterials: [],
  existingTypes: [],
};

// Funções para acessar e modificar o estado de forma segura.
export const getState = () => appState;

export const setState = (newState) => {
  Object.assign(appState, newState);
};

export const updateFilters = (form) => {
    appState.filters.material = form.material.value;
    appState.filters.tipo = form.tipo.value;
    appState.filters.espessura = form.espessura.value;
    appState.filters.largura = form.largura.value;
    appState.filters.altura = form.altura.value;
    appState.currentPage = 1; // Reseta a página ao aplicar novos filtros
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