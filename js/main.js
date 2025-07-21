// js/main.js
console.log("main.js carregado");

import { initializeAuth } from "./session.js"; // DICA: Renomeei para session.js para ficar mais claro
import { initializeRetalhos } from "./retalhos.js";
import { initializeModals } from "./modals.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inicializa o gerenciador de sessão (login/logout)
  initializeAuth();

  // Inicializa os filtros e a busca de retalhos
  initializeRetalhos();

  // Inicializa todos os eventos dos modais (cadastro, reserva, etc)
  initializeModals();
});
