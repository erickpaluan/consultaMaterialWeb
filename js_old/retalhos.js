import { supabase } from "./supabaseClient.js";
import { ui } from "./uiElements.js";
import { formatDecimal } from "./utils.js";
import { getCurrentUserRole } from "./session.js";
import { handleReserveClick, handleDeleteClick } from "./modals.js";

let currentPage = 1;
let totalItems = 0;
const itemsPerPage = 10;
let sortColumn = "numero";
let sortDirection = true;

const toggleClearButtonVisibility = () => {
  const hasFilter =
    materialSelect.value ||
    tipoSelect.value ||
    espessuraSelect.value ||
    larguraInput.value ||
    alturaInput.value;
  if (hasFilter) {
    clearBtn.classList.remove("hidden");
  } else {
    clearBtn.classList.add("hidden");
  }
};
const renderActionButtons = (role) => {
  document
    .querySelectorAll(".action-buttons-cell, .card-action-buttons")
    .forEach((container) => {
      const retalhoId = container.closest("[data-id]")?.dataset.id;
      if (!retalhoId) return;

      container.innerHTML = ""; // Limpa botões antigos

      if (role) {
        // Qualquer usuário logado pode reservar
        const reserveBtn = document.createElement("button");
        reserveBtn.className =
          "reserve-btn bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full inline-flex items-center justify-center shadow-md mr-1";
        reserveBtn.title = "Reservar Retalho";
        reserveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
        reserveBtn.addEventListener("click", () =>
          handleReserveClick(retalhoId)
        );
        container.appendChild(reserveBtn);
      }
      if (role === "admin") {
        // Apenas admin pode excluir
        const deleteBtn = document.createElement("button");
        deleteBtn.className =
          "delete-btn bg-red-500 hover:bg-red-600 text-white p-2 rounded-full inline-flex items-center justify-center shadow-md";
        deleteBtn.title = "Excluir Retalho";
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener("click", () => handleDeleteClick(retalhoId));
        container.appendChild(deleteBtn);
      }
    });
};

const renderRetalhos = (retalhos) => {
  ui.resultsTableBody.innerHTML = "";
  ui.resultsCardsContainer.innerHTML = "";
  ui.emptyState.classList.toggle("hidden", retalhos.length > 0);
  ui.resultsContainer.classList.toggle("hidden", retalhos.length === 0);

  retalhos.forEach((retalho) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50";
    row.dataset.id = retalho.id;
    row.innerHTML = `
            <td class="p-3 text-center">${retalho.numero}</td>
            <td class="p-3 text-center">${retalho.gaveta}</td>
            <td class="p-3 text-center">${retalho.material}</td>
            <td class="p-3 text-center">${retalho.tipo}</td>
            <td class="p-3 text-center">${formatDecimal(retalho.espessura)}</td>
            <td class="p-3 text-center">${formatDecimal(
              retalho.comprimento
            )}</td>
            <td class="p-3 text-center">${formatDecimal(retalho.largura)}</td>
            <td class="p-3 text-center">${retalho.quantidade}</td>
            <td class="p-3">${retalho.obs || ""}</td>
            <td class="p-3 text-center action-buttons-cell"></td>`;
    ui.resultsTableBody.appendChild(row);

    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow-md";
    card.dataset.id = retalho.id;
    card.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold">Nº ${retalho.numero}</h3>
                <div class="flex space-x-2 card-action-buttons"></div>
            </div>
            <p><strong>Gaveta:</strong> ${retalho.gaveta}</p>
            <p><strong>Material:</strong> ${retalho.material}</p>
            <p><strong>Comprimento:</strong> ${formatDecimal(
              retalho.comprimento
            )} m</p>`;
    ui.resultsCardsContainer.appendChild(card);
  });
  renderActionButtons(getCurrentUserRole());
};

const updatePaginationControls = () => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  ui.pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
  ui.prevPageBtn.disabled = currentPage === 1;
  ui.nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
};

export const fetchRetalhos = async () => {
  ui.loader.classList.remove("hidden");
  ui.resultsContainer.classList.add("hidden");

  let query = supabase.from("retalhos").select("*", { count: "exact" });
  if (ui.materialSelect.value)
    query = query.eq("material", ui.materialSelect.value);
  if (ui.tipoSelect.value) query = query.eq("tipo", ui.tipoSelect.value);
  if (ui.espessuraSelect.value)
    query = query.eq("espessura", ui.espessuraSelect.value);
  if (ui.larguraInput.value)
    query = query.gte("largura", ui.larguraInput.value);
  if (ui.alturaInput.value)
    query = query.gte("comprimento", ui.alturaInput.value);
  query = query.gt("quantidade", 0);
  query = query.order(sortColumn, { ascending: sortDirection });
  const from = (currentPage - 1) * itemsPerPage;
  query = query.range(from, from + itemsPerPage - 1);

  const { data, error, count } = await query;
  ui.loader.classList.add("hidden");

  if (error) return console.error("Erro ao buscar retalhos:", error);

  totalItems = count;
  renderRetalhos(data);
  updatePaginationControls();
};

export const carregarFiltros = async () => {
  const { data, error } = await supabase
    .from("retalhos")
    .select("material, tipo, espessura");
  if (error) return console.error("Erro ao carregar filtros:", error);

  const materiais = [...new Set(data.map((item) => item.material))]
    .filter(Boolean)
    .sort();
  const tipos = [...new Set(data.map((item) => item.tipo))]
    .filter(Boolean)
    .sort();
  const espessuras = [...new Set(data.map((item) => item.espessura))]
    .filter(Boolean)
    .sort((a, b) => a - b);

  ui.materialSelect.innerHTML = '<option value="">Todos</option>';
  materiais.forEach(
    (m) => (ui.materialSelect.innerHTML += `<option value="${m}">${m}</option>`)
  );

  ui.tipoSelect.innerHTML = '<option value="">Todos</option>';
  tipos.forEach(
    (t) => (ui.tipoSelect.innerHTML += `<option value="${t}">${t}</option>`)
  );

  ui.espessuraSelect.innerHTML = '<option value="">Todas</option>';
  espessuras.forEach(
    (e) =>
      (ui.espessuraSelect.innerHTML += `<option value="${e}">${e}</option>`)
  );
  toggleClearButtonVisibility();
};

export const initializeRetalhos = () => {
  ui.filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentPage = 1;
    fetchRetalhos();
  });
  ui.clearBtn.addEventListener("click", () => {
    ui.filterForm.reset();
    currentPage = 1;
    fetchRetalhos();
  });
  ui.prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchRetalhos();
    }
  });
  ui.nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      fetchRetalhos();
    }
  });
  ui.tableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const column = header.dataset.sort;
      if (sortColumn === column) {
        sortDirection = !sortDirection;
      } else {
        sortColumn = column;
        sortDirection = true;
      }
      fetchRetalhos();
    });
  });
  carregarFiltros();
};
