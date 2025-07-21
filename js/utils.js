export const openModal = (modalElement) => {
  modalElement.classList.remove("hidden");
  const transformElement = modalElement.querySelector(
    ".transform, div:first-child"
  );
  setTimeout(() => {
    if (transformElement) {
      transformElement.classList.remove("scale-95", "opacity-0");
    }
  }, 10);
};

export const closeModal = (modalElement) => {
  const transformElement = modalElement.querySelector(
    ".transform, div:first-child"
  );
  if (transformElement) {
    transformElement.classList.add("scale-95", "opacity-0");
  }
  setTimeout(() => {
    modalElement.classList.add("hidden");
  }, 300);
};

export const formatDecimal = (value) => {
  if (value === null || value === undefined) return "";
  const num = parseFloat(value);
  return isNaN(num) ? "" : num.toFixed(2).replace(".", ",");
};

export const parseDecimal = (value) => {
  return typeof value === "string"
    ? parseFloat(value.replace(",", "."))
    : value;
};
