// js/ui/modals.js

/**
 * Controla a exibição e o fechamento de todos os modais da aplicação.
 */

export function openModal(modalElement) {
  modalElement.classList.remove("hidden");
  setTimeout(() => {
    const transformDiv = modalElement.querySelector(".transform");
    if (transformDiv) {
      transformDiv.classList.remove("scale-95", "opacity-0");
      transformDiv.classList.add("scale-100", "opacity-100");
    }
  }, 10);
}

export function closeModal(modalElement) {
  const transformDiv = modalElement.querySelector(".transform");
  if (transformDiv) {
    transformDiv.classList.remove("scale-100", "opacity-100");
    transformDiv.classList.add("scale-95", "opacity-0");
  }
  setTimeout(() => {
    modalElement.classList.add("hidden");
  }, 300);
}