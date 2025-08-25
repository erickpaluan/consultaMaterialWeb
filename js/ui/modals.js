/**
 * Abre um elemento de modal, tornando-o visível com uma animação.
 * @param {HTMLElement} modalElement - O elemento principal do modal (com a classe .modal).
 */
export function openModal(modalElement) {
  // Verificação de segurança: não faz nada se o elemento não for encontrado.
  if (!modalElement) {
    console.error(
      "Tentativa de abrir um modal que não existe no DOM.",
      modalElement,
    );
    return;
  }

  // 1. Torna o modal parte do layout, mas ainda transparente.
  modalElement.classList.remove("hidden");

  // 2. Um pequeno delay para garantir que a transição CSS seja aplicada.
  setTimeout(() => {
    // 3. Remove a opacidade para tornar o modal visível.
    modalElement.classList.remove("opacity-0");

    // 4. Anima a caixa interna do modal.
    const modalBox = modalElement.querySelector(".modal-box");
    if (modalBox) {
      modalBox.classList.remove("scale-95");
    }
  }, 10); // 10ms é suficiente.
}

/**
 * Fecha um elemento de modal, tornando-o invisível com uma animação.
 * @param {HTMLElement} modalElement - O elemento principal do modal (com a classe .modal).
 */
export function closeModal(modalElement) {
  // Verificação de segurança.
  if (!modalElement) {
    console.error(
      "Tentativa de fechar um modal que não existe no DOM.",
      modalElement,
    );
    return;
  }

  // 1. Inicia a animação de saída, tornando o modal transparente.
  modalElement.classList.add("opacity-0");

  // 2. Anima a caixa interna.
  const modalBox = modalElement.querySelector(".modal-box");
  if (modalBox) {
    modalBox.classList.add("scale-95");
  }

  // 3. Aguarda a animação CSS terminar (definida como 200ms no <style>) antes de esconder completamente.
  setTimeout(() => {
    modalElement.classList.add("hidden");
  }, 200);
}
