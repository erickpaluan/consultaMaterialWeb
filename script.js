import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rlgsehxrpkxlavxdpzgz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ3NlaHhycGt4bGF2eGRwemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTY2MjgsImV4cCI6MjA2ODE3MjYyOH0.S_doyB0_3GuKRWCb0RXOXzTBvhsiEp_l9X0kWMt86Xg"
);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("filter-form");
  const materialSelect = document.getElementById("material");
  const tipoSelect = document.getElementById("tipo");
  const espessuraSelect = document.getElementById("espessura");
  const larguraInput = document.getElementById("largura");
  const alturaInput = document.getElementById("altura");
  const clearBtn = document.getElementById("clear-btn");

  const resultsTableBody = document.getElementById("tabela-retalhos-body");
  const resultsCardsContainer = document.getElementById("cards-container");
  const loader = document.getElementById("loader");
  const emptyState = document.getElementById("empty-state");
  const resultsContainer = document.getElementById("results-container");

  const paginationControls = document.getElementById("pagination-controls");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const pageInfo = document.getElementById("page-info");
  const tableHeaders = document.querySelectorAll("th[data-sort]");

  const showReservedBtn = document.getElementById("show-reserved-btn");
  const reservedModal = document.getElementById("reserved-modal");
  const reservedModalContent = document.getElementById("pdf-content");
  const closeModalBtn = document.getElementById("close-reserved-modal-btn");
  const modalLoader = document.getElementById("modal-loader");
  const createPdfBtn = document.getElementById("create-pdf-btn");
  const osSearchInput = document.getElementById("os-search-input");

  const openRegisterModalBtn = document.getElementById(
    "open-register-modal-btn"
  );
  const registerModal = document.getElementById("register-modal");
  const closeRegisterModalBtn = document.getElementById(
    "close-register-modal-btn"
  );
  const registerForm = document.getElementById("register-form");
  const regMaterialSelect = document.getElementById("reg-material");
  const regNovoMaterialContainer = document.getElementById(
    "reg-novo-material-container"
  );
  const regNovoMaterialInput = document.getElementById(
    "reg-novo-material-input"
  );
  const regSalvarNovoMaterialBtn = document.getElementById(
    "reg-salvar-novo-material-btn"
  );
  const regCancelarNovoMaterialBtn = document.getElementById(
    "reg-cancelar-novo-material-btn"
  );
  const regTipoSelect = document.getElementById("reg-tipo");
  const regNovoTipoContainer = document.getElementById(
    "reg-novo-tipo-container"
  );
  const regNovoTipoInput = document.getElementById("reg-novo-tipo-input");
  const regSalvarNovoTipoBtn = document.getElementById(
    "reg-salvar-novo-tipo-btn"
  );
  const regCancelarNovoTipoBtn = document.getElementById(
    "reg-cancelar-novo-tipo-btn"
  );
  const regSubmitBtn = document.getElementById("reg-submit-btn");
  const regClearBtn = document.getElementById("reg-clear-btn");

  const reserveModal = document.getElementById("reserve-modal");
  const reserveForm = document.getElementById("reserve-form");
  const reserveInputOs = document.getElementById("reserve-input-os");
  const reserveInputQuantidade = document.getElementById(
    "reserve-input-quantidade"
  );
  const reserveQuantityContainer = document.getElementById(
    "reserve-quantity-container"
  );
  const reserveAvailableText = document.getElementById("reserve-available");
  const reserveConfirmBtn = document.getElementById("reserve-confirm-btn");
  const closeReserveModalBtn = document.getElementById(
    "close-reserve-modal-btn"
  );
  let currentRetalhoId = null;
  let currentQuantidadeDisponivel = 0;

  let existingMaterials = [];
  let existingTypes = [];
  let currentPage = 1;
  let totalItems = 0;
  const itemsPerPage = 10;
  let sortColumn = "numero";
  let sortDirection = true;

  const camposObrigatoriosCadastro = [
    "reg-numero",
    "reg-gaveta",
    "reg-material",
    "reg-tipo",
    "reg-espessura",
    "reg-comprimento",
    "reg-largura",
    "reg-quantidade",
  ];

  const openModal = (modalElement) => {
    modalElement.classList.remove("hidden");
    setTimeout(() => {
      modalElement
        .querySelector(".transform")
        .classList.remove("scale-95", "opacity-0");
      modalElement
        .querySelector(".transform")
        .classList.add("scale-100", "opacity-100");
    }, 10);
  };

  const closeModal = (modalElement) => {
    modalElement
      .querySelector(".transform")
      .classList.remove("scale-100", "opacity-100");
    modalElement
      .querySelector(".transform")
      .classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modalElement.classList.add("hidden");
    }, 300);
  };

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

  const addAndSelectOption = (selectElement, value, text) => {
    const newOption = document.createElement("option");
    newOption.value = value;
    newOption.textContent = text;
    const lastOption = selectElement.lastElementChild;
    selectElement.insertBefore(newOption, lastOption);
    selectElement.value = value;
  };

  const carregarMateriais = async (selectedMaterial = "") => {
    const { data, error } = await supabase
      .from("retalhos")
      .select("material")
      .order("material", { ascending: true });
    if (error) {
      console.error("Erro ao carregar materiais:", error);
      return;
    }
    const materiaisUnicos = [
      ...new Set(data.map((item) => item.material)),
    ].filter(Boolean);
    existingMaterials = materiaisUnicos.map((m) => m.toLowerCase());
    regMaterialSelect.innerHTML = `<option value="">Selecione...</option>`;
    materiaisUnicos.forEach((material) => {
      const option = document.createElement("option");
      option.value = material;
      option.textContent = material;
      regMaterialSelect.appendChild(option);
    });
    regMaterialSelect.innerHTML += `<option value="novo-material">-- Novo Material --</option>`;
    if (selectedMaterial) {
      regMaterialSelect.value = selectedMaterial;
    }
  };

  const carregarTipos = async (material, selectedTipo = "") => {
    regTipoSelect.innerHTML = `<option value="">Selecione...</option>`;
    if (material) {
      const { data, error } = await supabase
        .from("retalhos")
        .select("tipo")
        .eq("material", material)
        .order("tipo", { ascending: true });
      if (error) {
        console.error("Erro ao carregar tipos:", error);
        return;
      }
      const tiposUnicos = [...new Set(data.map((item) => item.tipo))].filter(
        Boolean
      );
      existingTypes = tiposUnicos.map((t) => t.toLowerCase());
      tiposUnicos.forEach((tipo) => {
        const option = document.createElement("option");
        option.value = tipo;
        option.textContent = tipo;
        regTipoSelect.appendChild(option);
      });
    }
    regTipoSelect.innerHTML += `<option value="novo-tipo">-- Novo Tipo --</option>`;
    if (selectedTipo) {
      regTipoSelect.value = selectedTipo;
    }
  };

  const carregarMateriaisFiltro = async () => {
    const { data } = await supabase.from("retalhos").select("material");
    const materiaisUnicos = [
      ...new Set((data || []).map((m) => m.material)),
    ].sort();
    const materialAtual = materialSelect.value;
    materialSelect.innerHTML = '<option value="">Todos</option>';
    materiaisUnicos.forEach((mat) => {
      if (mat) {
        const opt = document.createElement("option");
        opt.value = mat;
        opt.textContent = mat;
        materialSelect.appendChild(opt);
      }
    });
    if (materialAtual) {
      materialSelect.value = materialAtual;
      await carregarTiposFiltro();
    }
    await carregarEspessuras();
    toggleClearButtonVisibility();
  };

  const carregarTiposFiltro = async () => {
    const material = materialSelect.value;
    if (!material) {
      tipoSelect.innerHTML = '<option value="">Todos os Tipos</option>';
      carregarEspessuras();
      toggleClearButtonVisibility();
      return;
    }
    const { data } = await supabase
      .from("retalhos")
      .select("tipo")
      .eq("material", material);
    const tiposUnicos = [...new Set((data || []).map((t) => t.tipo))].sort();
    tipoSelect.innerHTML = '<option value="">Todos os Tipos</option>';
    tiposUnicos.forEach((tipo) => {
      if (tipo) {
        const opt = document.createElement("option");
        opt.value = tipo;
        opt.textContent = tipo;
        tipoSelect.appendChild(opt);
      }
    });
    await carregarEspessuras();
    toggleClearButtonVisibility();
  };

  const carregarEspessuras = async () => {
    const material = materialSelect.value;
    const tipo = tipoSelect.value;
    if (!material && !tipo) {
      espessuraSelect.innerHTML =
        '<option value="">Todas as Espessuras</option>';
      toggleClearButtonVisibility();
      return;
    }
    let query = supabase.from("retalhos").select("espessura");
    if (material) {
      query = query.eq("material", material);
    }
    if (tipo) {
      query = query.eq("tipo", tipo);
    }
    const { data } = await query;
    const espessurasUnicas = [
      ...new Set((data || []).map((e) => e.espessura)),
    ].sort((a, b) => a - b);
    espessuraSelect.innerHTML = '<option value="">Todas as Espessuras</option>';
    espessurasUnicas.forEach((espessura) => {
      if (espessura) {
        const opt = document.createElement("option");
        opt.value = espessura;
        opt.textContent = `${espessura}mm`;
        espessuraSelect.appendChild(opt);
      }
    });
    toggleClearButtonVisibility();
  };

  const carregarRetalhos = async () => {
    loader.classList.remove("hidden");
    resultsContainer.classList.add("hidden");
    emptyState.classList.add("hidden");
    paginationControls.classList.add("hidden");

    const material = materialSelect.value;
    const tipo = tipoSelect.value;
    const espessura = espessuraSelect.value;
    const largura = parseFloat(larguraInput.value);
    const altura = parseFloat(alturaInput.value);

    try {
      let query = supabase
        .from("retalhos")
        .select("*", { count: "exact" })
        .order(sortColumn, { ascending: sortDirection });
      if (material) {
        query = query.eq("material", material);
      }
      if (tipo) {
        query = query.eq("tipo", tipo);
      }
      if (espessura) {
        query = query.eq("espessura", espessura);
      }
      if (!isNaN(largura)) {
        query = query.gte("largura", largura);
      }
      if (!isNaN(altura)) {
        query = query.gte("comprimento", altura);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      totalItems = count;

      resultsTableBody.innerHTML = "";
      resultsCardsContainer.innerHTML = "";
      if (!data.length) {
        emptyState.classList.remove("hidden");
      } else {
        renderResults(data);
        resultsContainer.classList.remove("hidden");
        if (totalItems > itemsPerPage) {
          paginationControls.classList.remove("hidden");
        }
      }
      updatePaginationControls();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível carregar os retalhos.",
      });
    } finally {
      loader.classList.add("hidden");
    }
    toggleClearButtonVisibility();
  };

  const renderResults = (data) => {
    data.forEach((item) => {
      const rowClass = item.reservado
        ? "border-b border-gray-200 hover:bg-gray-50"
        : "border-b border-gray-200 hover:bg-gray-50";
      const row = document.createElement("tr");
      row.className = rowClass;
      row.innerHTML = `
        <td class="p-3 text-center">${item.numero}</td>
        <td class="p-3 text-center">${item.gaveta}</td>
        <td class="p-3 text-center">${item.material}</td>
        <td class="p-3 text-center">${item.tipo}</td>
        <td class="p-3 text-center">${item.espessura}mm</td>
        <td class="p-3 text-center">${item.comprimento}m</td>
        <td class="p-3 text-center">${item.largura}m</td>
        <td class="p-3 text-center">${item.quantidade}</td>
        <td class="p-3 text-left">${item.obs || "N/A"}</td>
        <td class="p-3 text-center">
          ${
            item.reservado && item.quantidade > 0
              ? `<span class="text-yellow-700 text-sm" title="Reservado">&#x25cf;</span>`
              : ""
          }
          <button data-id="${item.id}" data-quantidade="${
        item.quantidade
      }" class="reserve-btn bg-blue-500 text-white px-3 py-1 text-sm rounded-md shadow-sm hover:bg-blue-600 ${
        item.quantidade === 0 ? "opacity-50 cursor-not-allowed" : ""
      }" ${item.quantidade === 0 ? "disabled" : ""}>
            Reservar
          </button>
        </td>`;
      resultsTableBody.appendChild(row);

      const cardClass = item.reservado
        ? "bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-2"
        : "bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-2";
      const card = document.createElement("div");
      card.className = cardClass;
      card.innerHTML = `
        <div class="flex justify-between items-center font-bold text-lg">
          <span>Nº: ${item.numero}</span>
          <span class="text-sm font-medium text-gray-600">Gaveta: ${
            item.gaveta
          }</span>
        </div>
        <div class="text-gray-700">
          <p><strong>Material:</strong> ${item.material} - ${item.tipo}</p>
          <p><strong>Medidas:</strong> ${item.comprimento}m x ${
        item.largura
      }m x ${item.espessura}mm</p>
          <p><strong>Quantidade:</strong> ${item.quantidade}</p>
          ${item.obs ? `<p><strong>Obs:</strong> ${item.obs}</p>` : ""}
          ${
            item.reservado && item.quantidade > 0
              ? `<p class="text-yellow-700 font-bold" title="Reservado">&#x25cf; Reservado</p>`
              : ""
          }
        </div>
        <div class="pt-2">
          <button data-id="${item.id}" data-quantidade="${
        item.quantidade
      }" class="reserve-btn w-full bg-blue-500 text-white py-2 rounded-md shadow-sm hover:bg-blue-600 ${
        item.quantidade === 0 ? "opacity-50 cursor-not-allowed" : ""
      }" ${item.quantidade === 0 ? "disabled" : ""}>
            Reservar
          </button>
        </div>`;
      resultsCardsContainer.appendChild(card);
    });
  };

  const pedirOS = async (id, quantidadeAtual) => {
    currentRetalhoId = id;
    currentQuantidadeDisponivel = quantidadeAtual;
    reserveInputOs.value = "";
    reserveInputQuantidade.value = 1;
    if (quantidadeAtual > 1) {
      reserveQuantityContainer.classList.remove("hidden");
      reserveInputQuantidade.max = quantidadeAtual;
      reserveAvailableText.textContent = `Disponível: ${quantidadeAtual}`;
    } else {
      reserveQuantityContainer.classList.add("hidden");
    }
    openModal(reserveModal);
  };

  const processarReserva = async () => {
    const numeroOS = reserveInputOs.value.trim();
    const quantidadeReservar = parseInt(reserveInputQuantidade.value) || 1;

    if (!numeroOS) {
      Swal.fire("Atenção", "Por favor, insira o número da OS.", "warning");
      return;
    }

    if (
      quantidadeReservar <= 0 ||
      quantidadeReservar > currentQuantidadeDisponivel
    ) {
      Swal.fire(
        "Atenção",
        `A quantidade deve ser entre 1 e ${currentQuantidadeDisponivel}.`,
        "warning"
      );
      return;
    }

    reserveConfirmBtn.disabled = true;
    const novaQuantidade = currentQuantidadeDisponivel - quantidadeReservar;

    try {
      const { error: reservaError } = await supabase.from("reservas").insert({
        retalho_id: currentRetalhoId,
        numero_os: numeroOS,
        quantidade_reservada: quantidadeReservar,
      });

      if (reservaError) {
        throw reservaError;
      }

      const updateData = {
        quantidade: novaQuantidade,
        reservado: true,
      };

      const { error: retalhoError } = await supabase
        .from("retalhos")
        .update(updateData)
        .eq("id", currentRetalhoId);

      if (retalhoError) {
        throw retalhoError;
      }

      closeModal(reserveModal);
      Swal.fire("Sucesso!", "Retalho reservado com sucesso.", "success");
      carregarRetalhos();
    } catch (error) {
      console.error("Erro ao reservar retalho:", error);
      Swal.fire(
        "Erro",
        "Não foi possível reservar o retalho. Tente novamente.",
        "error"
      );
    } finally {
      reserveConfirmBtn.disabled = false;
    }
  };

  const limparFiltros = () => {
    materialSelect.value = "";
    tipoSelect.innerHTML = '<option value="">Todos os Tipos</option>';
    espessuraSelect.innerHTML = '<option value="">Todas as Espessuras</option>';
    larguraInput.value = "";
    alturaInput.value = "";
    currentPage = 1;
    carregarRetalhos();
    toggleClearButtonVisibility();
  };

  const fetchReservedRetalhos = async (searchTerm = "") => {
    reservedModalContent.innerHTML = "";
    modalLoader.classList.remove("hidden");
    osSearchInput.value = searchTerm;
    try {
      let query = supabase
        .from("reservas")
        .select(
          `id, numero_os, quantidade_reservada, data_reserva, retalhos(id, numero, material, tipo, espessura, comprimento, largura, gaveta)`
        )
        .order("data_reserva", { ascending: false });
      if (searchTerm) {
        query = query.ilike("numero_os", `%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data.length === 0) {
        reservedModalContent.innerHTML = `<p class="text-center text-gray-500 p-4">Nenhum retalho reservado no momento.</p>`;
      } else {
        renderReservedItems(data);
      }
    } catch (error) {
      console.error("Erro ao carregar retalhos reservados:", error);
      reservedModalContent.innerHTML = `<p class="text-center text-red-500 p-4">Erro ao carregar reservas.</p>`;
    } finally {
      modalLoader.classList.add("hidden");
    }
  };

  const renderReservedItems = (data) => {
    const table = document.createElement("table");
    table.className =
      "w-full table-auto border-collapse mt-4 text-sm text-gray-700 rounded-md overflow-hidden shadow-md";
    const thead = document.createElement("thead");
    thead.className = "bg-gray-200 text-left font-bold";
    thead.innerHTML = `
      <tr>
        <th class="p-3">Nº Retalho</th>
        <th class="p-3">OS</th>
        <th class="p-3">Material</th>
        <th class="p-3">Medidas (m)</th>
        <th class="p-3">Esp. (mm)</th>
        <th class="p-3">Qtd. Reserv.</th>
        <th class="p-3">Gaveta</th>
        <th class="p-3">Data Reserva</th>
        <th class="p-3">Ações</th>
      </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    tbody.className = "bg-white divide-y divide-gray-200";
    data.forEach((item) => {
      const retalho = item.retalhos;
      const dataReserva = item.data_reserva
        ? new Date(item.data_reserva).toLocaleDateString("pt-BR")
        : "N/A";
      const row = document.createElement("tr");
      row.className = "hover:bg-gray-50 transition-colors duration-200";
      row.innerHTML = `
        <td class="p-3">${retalho.numero}</td>
        <td class="p-3">${item.numero_os}</td>
        <td class="p-3">${retalho.material} - ${retalho.tipo}</td>
        <td class="p-3">${retalho.comprimento} x ${retalho.largura}</td>
        <td class="p-3">${retalho.espessura}</td>
        <td class="p-3">${item.quantidade_reservada}</td>
        <td class="p-3">${retalho.gaveta}</td>
        <td class="p-3">${dataReserva}</td>
        <td class="p-3">
          <button class="cancel-btn text-red-500 hover:text-red-700 text-lg" title="Cancelar" data-reserva-id="${item.id}" data-retalho-id="${retalho.id}" data-quantidade-reservada="${item.quantidade_reservada}">
            &#x21BA;
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    reservedModalContent.appendChild(table);
  };

  const cancelarReserva = async (reservaId, retalhoId, quantidadeReservada) => {
    const { isConfirmed } = await Swal.fire({
      title: "Tem certeza?",
      text: "Esta ação irá cancelar a reserva e devolver o retalho ao estoque.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, cancelar!",
      cancelButtonText: "Não",
    });
    if (isConfirmed) {
      try {
        const { error: deleteError } = await supabase
          .from("reservas")
          .delete()
          .eq("id", reservaId);
        if (deleteError) {
          throw deleteError;
        }
        const { data: retalhoData, error: retalhoError } = await supabase
          .from("retalhos")
          .select("quantidade")
          .eq("id", retalhoId)
          .single();
        if (retalhoError) {
          throw retalhoError;
        }
        const quantidadeAtual = retalhoData.quantidade;
        const novaQuantidade = quantidadeAtual + quantidadeReservada;
        const { data: outrasReservas, error: outrasReservasError } =
          await supabase
            .from("reservas")
            .select("id")
            .eq("retalho_id", retalhoId);
        if (outrasReservasError) {
          throw outrasReservasError;
        }
        const updateData = { quantidade: novaQuantidade };
        if (outrasReservas.length === 0) {
          updateData.reservado = false;
        }
        const { error: updateError } = await supabase
          .from("retalhos")
          .update(updateData)
          .eq("id", retalhoId);
        if (updateError) {
          throw updateError;
        }
        Swal.fire(
          "Cancelado!",
          "A reserva foi cancelada e o retalho devolvido ao estoque.",
          "success"
        );
        await fetchReservedRetalhos(osSearchInput.value);
        await carregarRetalhos();
      } catch (error) {
        console.error("Erro ao cancelar reserva:", error);
        Swal.fire("Erro", "Não foi possível cancelar a reserva.", "error");
      }
    }
  };

  const validateFieldCadastro = (input) => {
    const parentDiv = input.closest("div");
    const value = input.value.trim();
    parentDiv.classList.remove("has-error");
    const errorMessage = parentDiv.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
    let isValid = true;
    if (value === "" || (input.type === "number" && isNaN(parseFloat(value)))) {
      isValid = false;
      parentDiv.classList.add("has-error");
      const newErrorMessage = document.createElement("p");
      newErrorMessage.className = "text-red-500 text-xs mt-1 error-message";
      newErrorMessage.textContent = "Este campo é obrigatório.";
      parentDiv.appendChild(newErrorMessage);
    }
    return isValid;
  };

  const validateFormCadastro = () => {
    let isValid = true;
    camposObrigatoriosCadastro.forEach((id) => {
      const input = document.getElementById(id);
      if (!validateFieldCadastro(input)) {
        isValid = false;
      }
    });
    if (
      regMaterialSelect.value === "novo-material" &&
      !regNovoMaterialInput.value.trim()
    ) {
      const parentDiv = regNovoMaterialInput.closest("div");
      parentDiv.classList.add("has-error");
      let errorMessage = parentDiv.querySelector(".error-message");
      if (!errorMessage) {
        errorMessage = document.createElement("p");
        errorMessage.className = "text-red-500 text-xs mt-1 error-message";
        errorMessage.textContent = "Por favor, insira o nome do novo material.";
        parentDiv.appendChild(errorMessage);
      }
      isValid = false;
    } else {
      const parentDiv = regNovoMaterialInput.closest("div");
      parentDiv.classList.remove("has-error");
      const errorMessage = parentDiv.querySelector(".error-message");
      if (errorMessage) errorMessage.remove();
    }
    if (regTipoSelect.value === "novo-tipo" && !regNovoTipoInput.value.trim()) {
      const parentDiv = regNovoTipoInput.closest("div");
      parentDiv.classList.add("has-error");
      let errorMessage = parentDiv.querySelector(".error-message");
      if (!errorMessage) {
        errorMessage = document.createElement("p");
        errorMessage.className = "text-red-500 text-xs mt-1 error-message";
        errorMessage.textContent = "Por favor, insira o nome do novo tipo.";
        parentDiv.appendChild(errorMessage);
      }
      isValid = false;
    } else {
      const parentDiv = regNovoTipoInput.closest("div");
      parentDiv.classList.remove("has-error");
      const errorMessage = parentDiv.querySelector(".error-message");
      if (errorMessage) errorMessage.remove();
    }
    return isValid;
  };

  const resetFormCadastro = () => {
    registerForm.reset();
    carregarMateriais();
    regNovoMaterialContainer.classList.add("hidden");
    regNovoTipoContainer.classList.add("hidden");
  };

  const checkForExistingRetalho = async (retalho) => {
    const { data, error } = await supabase
      .from("retalhos")
      .select("*")
      .eq("espessura", retalho.espessura)
      .eq("comprimento", retalho.comprimento)
      .eq("largura", retalho.largura);
    if (error) {
      console.error("Erro na verificação de duplicidade:", error);
      return { found: false, existingRetalho: null };
    }
    const existingRetalho = data.find(
      (item) =>
        item.material.toLowerCase() === retalho.material.toLowerCase() &&
        item.tipo.toLowerCase() === retalho.tipo.toLowerCase()
    );
    return {
      found: existingRetalho !== undefined,
      existingRetalho: existingRetalho,
    };
  };

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateFormCadastro()) {
      Swal.fire(
        "Atenção",
        "Por favor, preencha todos os campos obrigatórios.",
        "warning"
      );
      return;
    }
    regSubmitBtn.disabled = true;
    regSubmitBtn.querySelector(".reg-spinner").classList.remove("hidden");
    regSubmitBtn.querySelector(".reg-btn-text").textContent = "Salvando...";
    let materialValue = document.getElementById("reg-material").value;
    if (materialValue === "novo-material") {
      materialValue = document
        .getElementById("reg-novo-material-input")
        .value.trim();
    }
    let tipoValue = document.getElementById("reg-tipo").value;
    if (tipoValue === "novo-tipo") {
      tipoValue = document.getElementById("reg-novo-tipo-input").value.trim();
    }
    const novoRetalho = {
      numero: parseFloat(document.getElementById("reg-numero").value),
      gaveta: document.getElementById("reg-gaveta").value,
      material: materialValue,
      tipo: tipoValue,
      espessura: parseFloat(document.getElementById("reg-espessura").value),
      comprimento: parseFloat(document.getElementById("reg-comprimento").value),
      largura: parseFloat(document.getElementById("reg-largura").value),
      quantidade: parseFloat(document.getElementById("reg-quantidade").value),
      obs: document.getElementById("reg-obs").value || null,
      reservado: false,
    };
    const { found, existingRetalho } = await checkForExistingRetalho(
      novoRetalho
    );
    if (found) {
      const quantidadeDigitada = novoRetalho.quantidade;
      const quantidadeAtual = existingRetalho.quantidade;
      const { isConfirmed } = await Swal.fire({
        icon: "warning",
        title: "Retalho Duplicado Encontrado!",
        html: `Já existe um retalho com essas características. <br><br><span class="font-bold">Local:</span> Retalho nº ${existingRetalho.numero}, Gaveta ${existingRetalho.gaveta}<br><span class="font-bold">Quantidade atual:</span> ${quantidadeAtual}<br>Deseja somar a quantidade digitada (${quantidadeDigitada})?`,
        showCancelButton: true,
        confirmButtonText: "Sim, somar",
        cancelButtonText: "Não, obrigado",
        focusCancel: true,
      });
      if (isConfirmed) {
        const novaQuantidade = quantidadeAtual + quantidadeDigitada;
        const { error: updateError } = await supabase
          .from("retalhos")
          .update({ quantidade: novaQuantidade })
          .eq("id", existingRetalho.id);
        if (updateError) {
          console.error("Erro ao atualizar a quantidade:", updateError);
          Swal.fire({
            icon: "error",
            title: "Erro ao atualizar",
            text: "Não foi possível atualizar a quantidade. Tente novamente.",
          });
        } else {
          Swal.fire({
            icon: "success",
            title: "Quantidade atualizada!",
            text: `A nova quantidade é ${novaQuantidade}.`,
            showConfirmButton: false,
            timer: 2000,
          });
          resetFormCadastro();
          carregarRetalhos();
          carregarMateriaisFiltro();
        }
      } else {
        Swal.fire("Operação cancelada", "Nenhum dado foi alterado.", "info");
      }
      regSubmitBtn.disabled = false;
      regSubmitBtn.querySelector(".reg-spinner").classList.add("hidden");
      regSubmitBtn.querySelector(".reg-btn-text").textContent =
        "Cadastrar Retalho";
      return;
    }
    const { error } = await supabase.from("retalhos").insert([novoRetalho]);
    if (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro ao cadastrar",
        text: "Não foi possível cadastrar o retalho. Tente novamente.",
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Cadastrado com sucesso!",
        showConfirmButton: false,
        timer: 1500,
      });
      resetFormCadastro();
      carregarRetalhos();
      carregarMateriaisFiltro();
    }
    regSubmitBtn.disabled = false;
    regSubmitBtn.querySelector(".reg-spinner").classList.add("hidden");
    regSubmitBtn.querySelector(".reg-btn-text").textContent =
      "Cadastrar Retalho";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    currentPage = 1;
    carregarRetalhos();
  });

  clearBtn.addEventListener("click", limparFiltros);

  materialSelect.addEventListener("change", () => {
    carregarTiposFiltro();
    toggleClearButtonVisibility();
  });

  tipoSelect.addEventListener("change", () => {
    carregarEspessuras();
    toggleClearButtonVisibility();
  });

  espessuraSelect.addEventListener("change", toggleClearButtonVisibility);
  larguraInput.addEventListener("input", toggleClearButtonVisibility);
  alturaInput.addEventListener("input", toggleClearButtonVisibility);

  resultsTableBody.addEventListener("click", (e) => {
    const reserveButton = e.target.closest(".reserve-btn");
    if (reserveButton) {
      const id = reserveButton.dataset.id;
      const quantidade = parseInt(reserveButton.dataset.quantidade);
      pedirOS(id, quantidade);
    }
  });

  resultsCardsContainer.addEventListener("click", (e) => {
    const reserveButton = e.target.closest(".reserve-btn");
    if (reserveButton) {
      const id = reserveButton.dataset.id;
      const quantidade = parseInt(reserveButton.dataset.quantidade);
      pedirOS(id, quantidade);
    }
  });

  showReservedBtn.addEventListener("click", () => {
    openModal(reservedModal);
    fetchReservedRetalhos();
  });

  closeModalBtn.addEventListener("click", () => {
    closeModal(reservedModal);
  });

  reservedModal.addEventListener("click", (e) => {
    if (e.target === reservedModal) {
      closeModal(reservedModal);
    }
  });

  osSearchInput.addEventListener("input", (e) => {
    fetchReservedRetalhos(e.target.value);
  });

  reservedModalContent.addEventListener("click", (e) => {
    const cancelButton = e.target.closest(".cancel-btn");
    if (cancelButton) {
      const reservaId = cancelButton.dataset.reservaId;
      const retalhoId = cancelButton.dataset.retalhoId;
      const quantidadeReservada = parseInt(
        cancelButton.dataset.quantidadeReservada
      );
      cancelarReserva(reservaId, retalhoId, quantidadeReservada);
    }
  });

  createPdfBtn.addEventListener("click", () => {
    const pdfOptions = {
      margin: 10,
      filename: `RetalhosReservados_${new Date().toLocaleDateString()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    Swal.fire({
      title: "Gerando PDF...",
      text: "Por favor, aguarde.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        html2pdf()
          .set(pdfOptions)
          .from(reservedModalContent)
          .save()
          .then(() => {
            Swal.close();
          });
      },
    });
  });

  const updatePaginationControls = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= totalPages || totalPages === 0;
  };

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      carregarRetalhos();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      carregarRetalhos();
    }
  });

  const tabelaRetalhos = document.getElementById("results-container");
  tabelaRetalhos.addEventListener("click", (e) => {
    const header = e.target.closest("th[data-sort]");
    if (header) {
      const newSortColumn = header.dataset.sort;
      tableHeaders.forEach((th) =>
        th.classList.remove("sort-asc", "sort-desc")
      );
      if (sortColumn === newSortColumn) {
        sortDirection = !sortDirection;
      } else {
        sortColumn = newSortColumn;
        sortDirection = true;
      }
      currentPage = 1;
      carregarRetalhos();
      if (sortDirection) {
        header.classList.add("sort-asc");
      } else {
        header.classList.add("sort-desc");
      }
    }
  });

  openRegisterModalBtn.addEventListener("click", () => {
    openModal(registerModal);
    carregarMateriais();
    carregarTipos("");
  });

  closeRegisterModalBtn.addEventListener("click", () => {
    closeModal(registerModal);
    resetFormCadastro();
  });

  registerModal.addEventListener("click", (e) => {
    if (e.target === registerModal) {
      closeModal(registerModal);
      resetFormCadastro();
    }
  });

  regMaterialSelect.addEventListener("change", () => {
    const selectedMaterial = regMaterialSelect.value;
    if (selectedMaterial === "novo-material") {
      regNovoMaterialContainer.classList.remove("hidden");
      regNovoMaterialInput.focus();
    } else {
      regNovoMaterialContainer.classList.add("hidden");
    }
    carregarTipos(selectedMaterial);
    regTipoSelect.value = "";
    regNovoTipoContainer.classList.add("hidden");
    validateFieldCadastro(regMaterialSelect);
  });

  regTipoSelect.addEventListener("change", () => {
    if (regTipoSelect.value === "novo-tipo") {
      regNovoTipoContainer.classList.remove("hidden");
      regNovoTipoInput.focus();
    } else {
      regNovoTipoContainer.classList.add("hidden");
    }
    validateFieldCadastro(regTipoSelect);
  });

  regSalvarNovoMaterialBtn.addEventListener("click", () => {
    const novoMaterial = regNovoMaterialInput.value.trim();
    if (novoMaterial) {
      if (existingMaterials.includes(novoMaterial.toLowerCase())) {
        Swal.fire("Atenção", "Este material já está cadastrado.", "warning");
        return;
      }
      addAndSelectOption(regMaterialSelect, novoMaterial, novoMaterial);
      existingMaterials.push(novoMaterial.toLowerCase());
      regNovoMaterialContainer.classList.add("hidden");
      regNovoMaterialInput.value = "";
      carregarTipos(novoMaterial);
    } else {
      Swal.fire(
        "Atenção",
        "Por favor, insira o nome do novo material.",
        "warning"
      );
    }
  });

  regCancelarNovoMaterialBtn.addEventListener("click", () => {
    regMaterialSelect.value = "";
    regNovoMaterialContainer.classList.add("hidden");
    regNovoMaterialInput.value = "";
  });

  regSalvarNovoTipoBtn.addEventListener("click", () => {
    const novoTipo = regNovoTipoInput.value.trim();
    if (novoTipo) {
      if (existingTypes.includes(novoTipo.toLowerCase())) {
        Swal.fire(
          "Atenção",
          "Este tipo já está cadastrado para este material.",
          "warning"
        );
        return;
      }
      addAndSelectOption(regTipoSelect, novoTipo, novoTipo);
      existingTypes.push(novoTipo.toLowerCase());
      regNovoTipoContainer.classList.add("hidden");
      regNovoTipoInput.value = "";
    } else {
      Swal.fire("Atenção", "Por favor, insira o nome do novo tipo.", "warning");
    }
  });

  regCancelarNovoTipoBtn.addEventListener("click", () => {
    regTipoSelect.value = "";
    regNovoTipoContainer.classList.add("hidden");
    regNovoTipoInput.value = "";
  });

  camposObrigatoriosCadastro.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => validateFieldCadastro(input));
  });

  regClearBtn.addEventListener("click", resetFormCadastro);

  reserveConfirmBtn.addEventListener("click", processarReserva);
  closeReserveModalBtn.addEventListener("click", () => {
    closeModal(reserveModal);
  });
  reserveModal.addEventListener("click", (e) => {
    if (e.target === reserveModal) {
      closeModal(reserveModal);
    }
  });

  carregarMateriaisFiltro();
  carregarTiposFiltro();
  carregarRetalhos();
  toggleClearButtonVisibility();

  setInterval(() => {
    console.log("Atualizando materiais (auto)...");
    carregarMateriaisFiltro();
  }, 300000);

  window.addEventListener("focus", () => {
    console.log("Atualizando materiais (focus)");
    carregarMateriaisFiltro();
  });
});
