import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rlgsehxrpkxlavxdpzgz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ3NlaHhycGt4bGF2eGRwemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTY2MjgsImV4cCI6MjA2ODE3MjYyOH0.S_doyB0_3GuKRWCb0RXOXzTBvhsiEp_l9X0kWMt86Xg"
);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-retalho");
  const materialSelect = document.getElementById("material");
  const novoMaterialContainer = document.getElementById(
    "novo-material-container"
  );
  const novoMaterialInput = document.getElementById("novo-material-input");
  const salvarNovoMaterialBtn = document.getElementById(
    "salvar-novo-material-btn"
  );
  const cancelarNovoMaterialBtn = document.getElementById(
    "cancelar-novo-material-btn"
  );

  const tipoSelect = document.getElementById("tipo");
  const novoTipoContainer = document.getElementById("novo-tipo-container");
  const novoTipoInput = document.getElementById("novo-tipo-input");
  const salvarNovoTipoBtn = document.getElementById("salvar-novo-tipo-btn");
  const cancelarNovoTipoBtn = document.getElementById("cancelar-novo-tipo-btn");

  const submitBtn = form.querySelector('button[type="submit"]');
  const clearBtn = document.getElementById("clear-btn");

  const camposObrigatorios = [
    "numero",
    "gaveta",
    "material",
    "tipo",
    "espessura",
    "comprimento",
    "largura",
    "quantidade",
  ];

  let existingMaterials = [];
  let existingTypes = [];

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

    materialSelect.innerHTML = `<option value="">Selecione...</option>`;
    materiaisUnicos.forEach((material) => {
      const option = document.createElement("option");
      option.value = material;
      option.textContent = material;
      materialSelect.appendChild(option);
    });

    materialSelect.innerHTML += `<option value="novo-material">-- Novo Material --</option>`;

    if (selectedMaterial) {
      materialSelect.value = selectedMaterial;
    }
  };

  const carregarTipos = async (material, selectedTipo = "") => {
    tipoSelect.innerHTML = `<option value="">Selecione...</option>`;

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
        tipoSelect.appendChild(option);
      });
    }

    tipoSelect.innerHTML += `<option value="novo-tipo">-- Novo Tipo --</option>`;
    if (selectedTipo) {
      tipoSelect.value = selectedTipo;
    }
  };

  materialSelect.addEventListener("change", () => {
    const selectedMaterial = materialSelect.value;
    if (selectedMaterial === "novo-material") {
      novoMaterialContainer.classList.remove("hidden");
      novoMaterialInput.focus();
    } else {
      novoMaterialContainer.classList.add("hidden");
    }

    carregarTipos(selectedMaterial);

    tipoSelect.value = "";
    novoTipoContainer.classList.add("hidden");
    validateField(materialSelect);
  });

  tipoSelect.addEventListener("change", () => {
    if (tipoSelect.value === "novo-tipo") {
      novoTipoContainer.classList.remove("hidden");
      novoTipoInput.focus();
    } else {
      novoTipoContainer.classList.add("hidden");
    }
    validateField(tipoSelect);
  });

  salvarNovoMaterialBtn.addEventListener("click", () => {
    const novoMaterial = novoMaterialInput.value.trim();
    if (novoMaterial) {
      if (existingMaterials.includes(novoMaterial.toLowerCase())) {
        Swal.fire("Atenção", "Este material já está cadastrado.", "warning");
        return;
      }

      addAndSelectOption(materialSelect, novoMaterial, novoMaterial);
      existingMaterials.push(novoMaterial.toLowerCase());
      novoMaterialContainer.classList.add("hidden");
      novoMaterialInput.value = "";
    } else {
      Swal.fire(
        "Atenção",
        "Por favor, insira o nome do novo material.",
        "warning"
      );
    }
  });

  cancelarNovoMaterialBtn.addEventListener("click", () => {
    materialSelect.value = "";
    novoMaterialContainer.classList.add("hidden");
    novoMaterialInput.value = "";
  });

  salvarNovoTipoBtn.addEventListener("click", () => {
    const novoTipo = novoTipoInput.value.trim();
    if (novoTipo) {
      if (existingTypes.includes(novoTipo.toLowerCase())) {
        Swal.fire(
          "Atenção",
          "Este tipo já está cadastrado para este material.",
          "warning"
        );
        return;
      }

      addAndSelectOption(tipoSelect, novoTipo, novoTipo);
      existingTypes.push(novoTipo.toLowerCase());
      novoTipoContainer.classList.add("hidden");
      novoTipoInput.value = "";
    } else {
      Swal.fire("Atenção", "Por favor, insira o nome do novo tipo.", "warning");
    }
  });

  cancelarNovoTipoBtn.addEventListener("click", () => {
    tipoSelect.value = "";
    novoTipoContainer.classList.add("hidden");
    novoTipoInput.value = "";
  });

  const validateField = (input) => {
    const parentDiv = input.closest("div");
    const value = input.value.trim();

    parentDiv.classList.remove("has-error");
    const errorMessage = parentDiv.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }

    let isValid = true;
    if (value === "") {
      isValid = false;
      parentDiv.classList.add("has-error");

      const newErrorMessage = document.createElement("p");
      newErrorMessage.className = "text-red-500 text-xs mt-1 error-message";
      newErrorMessage.textContent = "Este campo é obrigatório.";
      parentDiv.appendChild(newErrorMessage);
    }
    return isValid;
  };

  const validateForm = () => {
    let isValid = true;
    camposObrigatorios.forEach((id) => {
      const input = document.getElementById(id);
      if (!validateField(input)) {
        isValid = false;
      }
    });

    if (
      materialSelect.value === "novo-material" &&
      !novoMaterialInput.value.trim()
    ) {
      const parentDiv = novoMaterialInput.closest("div");
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
      const parentDiv = novoMaterialInput.closest("div");
      parentDiv.classList.remove("has-error");
      const errorMessage = parentDiv.querySelector(".error-message");
      if (errorMessage) errorMessage.remove();
    }

    if (tipoSelect.value === "novo-tipo" && !novoTipoInput.value.trim()) {
      const parentDiv = novoTipoInput.closest("div");
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
      const parentDiv = novoTipoInput.closest("div");
      parentDiv.classList.remove("has-error");
      const errorMessage = parentDiv.querySelector(".error-message");
      if (errorMessage) errorMessage.remove();
    }

    return isValid;
  };

  camposObrigatorios.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => validateField(input));
  });

  const resetForm = () => {
    form.reset();
    carregarMateriais();
    novoMaterialContainer.classList.add("hidden");
    novoTipoContainer.classList.add("hidden");
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire(
        "Atenção",
        "Por favor, preencha todos os campos obrigatórios.",
        "warning"
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector(".spinner").classList.remove("hidden");
    submitBtn.querySelector(".btn-text").textContent = "Salvando...";

    let materialValue = document.getElementById("material").value;
    if (materialValue === "novo-material") {
      materialValue = document
        .getElementById("novo-material-input")
        .value.trim();
    }

    let tipoValue = document.getElementById("tipo").value;
    if (tipoValue === "novo-tipo") {
      tipoValue = document.getElementById("novo-tipo-input").value.trim();
    }

    const novoRetalho = {
      numero: parseFloat(document.getElementById("numero").value),
      gaveta: document.getElementById("gaveta").value,
      material: materialValue,
      tipo: tipoValue,
      espessura: parseFloat(document.getElementById("espessura").value),
      comprimento: parseFloat(document.getElementById("comprimento").value),
      largura: parseFloat(document.getElementById("largura").value),
      quantidade: parseFloat(document.getElementById("quantidade").value),
      obs: document.getElementById("obs").value || null,
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
        html: `Já existe um retalho com essas características. <br><br>
               <span class="font-bold">Local:</span> Retalho nº ${existingRetalho.numero}, Gaveta ${existingRetalho.gaveta}<br>
               <span class="font-bold">Quantidade atual:</span> ${quantidadeAtual}<br>
               Deseja somar a quantidade digitada (${quantidadeDigitada})?`,
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
          resetForm();
        }
      } else {
        Swal.fire("Operação cancelada", "Nenhum dado foi alterado.", "info");
      }

      submitBtn.disabled = false;
      submitBtn.querySelector(".spinner").classList.add("hidden");
      submitBtn.querySelector(".btn-text").textContent = "Cadastrar Retalho";
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
      resetForm();
    }

    submitBtn.disabled = false;
    submitBtn.querySelector(".spinner").classList.add("hidden");
    submitBtn.querySelector(".btn-text").textContent = "Cadastrar Retalho";
  });

  clearBtn.addEventListener("click", () => {
    resetForm();
  });

  carregarMateriais();
});
