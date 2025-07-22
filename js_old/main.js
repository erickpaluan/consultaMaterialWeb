// js/main.js
console.log("main.js carregado");

import { initializeAuth } from "./session.js";
import { initializeRetalhos } from "./retalhos.js";
import { initializeModals } from "./modals.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeAuth();
  initializeRetalhos();
  initializeModals();
});
