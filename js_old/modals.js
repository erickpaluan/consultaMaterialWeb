import { supabase } from "./supabaseClient.js";
import { ui } from "./uiElements.js";
import { openModal, closeModal, parseDecimal, formatDecimal } from "./utils.js";
import { fetchRetalhos, carregarFiltros } from "./retalhos.js";

let currentRetalhoId = null;

// --- AÇÕES ---
export const handleDeleteClick = async (retalhoId) => {
  const { isConfirmed } = await Swal.fire({
    title: "Tem certeza?",
    text: "Esta ação não poderá ser desfeita!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Sim, excluir!",
  });
  if (isConfirmed) {
    const { error } = await supabase
      .from("retalhos")
      .delete()
      .eq("id", retalhoId);
    if (error) return Swal.fire("Erro", error.message, "error");
    Swal.fire("Excluído!", "O retalho foi excluído.", "success");
    fetchRetalhos();
  }
};

export const handleReserveClick = async (retalhoId) => {
  currentRetalhoId = retalhoId;
  const { data, error } = await supabase
    .from("retalhos")
    .select("quantidade")
    .eq("id", retalhoId)
    .single();
  if (error)
    return Swal.fire("Erro", "Não foi possível carregar o retalho.", "error");

  const disponivel = data.quantidade;
  ui.reserveInputQuantidade.max = disponivel;
  ui.reserveInputQuantidade.value = 1;
  ui.reserveAvailableText.textContent = `Disponível: ${disponivel}`;
  ui.reserveConfirmBtn.disabled = disponivel === 0;
  openModal(ui.reserveModal);
};

// --- INICIALIZAÇÃO DOS MODAIS ---
export const initializeModals = () => {
  // --- Modal de Cadastro ---
  ui.openRegisterModalBtn.addEventListener("click", () =>
    openModal(ui.registerModal)
  );
  ui.closeRegisterModalBtn.addEventListener("click", () =>
    closeModal(ui.registerModal)
  );
  ui.registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    ui.regSubmitBtn.disabled = true;

    const formData = new FormData(ui.registerForm);
    const novoRetalho = {
      numero: parseInt(formData.get("numero")),
      gaveta: formData.get("gaveta"),
      material: formData.get("material"),
      tipo: formData.get("tipo"),
      espessura: parseDecimal(formData.get("espessura")),
      comprimento: parseDecimal(formData.get("comprimento")),
      largura: parseDecimal(formData.get("largura")),
      quantidade: parseInt(formData.get("quantidade")),
      obs: formData.get("obs"),
    };
    const { error } = await supabase.from("retalhos").insert([novoRetalho]);

    if (error) Swal.fire("Erro", error.message, "error");
    else {
      Swal.fire("Sucesso", "Retalho cadastrado!", "success");
      closeModal(ui.registerModal);
      fetchRetalhos();
      carregarFiltros();
    }
    ui.regSubmitBtn.disabled = false;
  });

  // --- Modal de Reserva ---
  ui.closeReserveModalBtn.addEventListener("click", () =>
    closeModal(ui.reserveModal)
  );
  ui.reserveConfirmBtn.addEventListener("click", async () => {
    const os = ui.reserveInputOs.value.trim();
    const quantidadeReservar = parseInt(ui.reserveInputQuantidade.value);
    if (!os || isNaN(quantidadeReservar) || quantidadeReservar <= 0) {
      return Swal.fire(
        "Atenção",
        "Preencha a OS e a quantidade corretamente.",
        "warning"
      );
    }

    // Simulação de chamada de uma função de banco de dados (Stored Procedure)
    const { error } = await supabase.rpc("reservar_retalho", {
      p_retalho_id: currentRetalhoId,
      p_quantidade_reservar: quantidadeReservar,
      p_numero_os: os,
      p_user_id: supabase.auth.user().id,
    });

    if (error) return Swal.fire("Erro na Reserva", error.message, "error");

    Swal.fire("Sucesso!", "Reserva confirmada.", "success");
    closeModal(ui.reserveModal);
    fetchRetalhos();
  });

  // --- Modal de Lista de Reservados ---
  ui.showReservedBtn.addEventListener("click", async () => {
    await searchReservedRetalhos();
    openModal(ui.reservedModal);
  });
  ui.closeReservedModalBtn.addEventListener("click", () =>
    closeModal(ui.reservedModal)
  );
  ui.osSearchInput.addEventListener("input", (e) =>
    searchReservedRetalhos(e.target.value)
  );
  ui.createPdfBtn.addEventListener("click", () => {
    if (typeof html2pdf !== "undefined") {
      html2pdf().from(ui.reservedModalContent).save("reservados.pdf");
    } else {
      Swal.fire("Erro", "Biblioteca de PDF não carregada.", "error");
    }
  });
};

const searchReservedRetalhos = async (osNumber = "") => {
  ui.modalLoader.classList.remove("hidden");
  let query = supabase.from("reservados_view").select("*");
  if (osNumber) {
    query = query.ilike("numero_os", `%${osNumber}%`);
  }
  const { data, error } = await query.order("data_reserva", {
    ascending: false,
  });

  if (error)
    return (ui.reservedModalContent.innerHTML = `<p class="text-red-500">Erro: ${error.message}</p>`);

  if (data.length === 0)
    return (ui.reservedModalContent.innerHTML = `<p>Nenhum item encontrado.</p>`);

  let htmlContent = `
        <h2 class="text-2xl font-bold mb-4">Relatório de Reservados</h2>
        <table class="min-w-full">
            <thead><tr><th>OS</th><th>Nº Retalho</th><th>Material</th><th>Qtd.</th><th>Data</th></tr></thead><tbody>`;
  data.forEach((item) => {
    htmlContent += `
            <tr>
                <td>${item.numero_os}</td>
                <td>${item.numero_retalho}</td>
                <td>${item.material_retalho}</td>
                <td>${item.quantidade_reservada}</td>
                <td>${new Date(item.data_reserva).toLocaleDateString(
                  "pt-BR"
                )}</td>
            </tr>`;
  });
  htmlContent += `</tbody></table>`;
  ui.reservedModalContent.innerHTML = htmlContent;
  ui.modalLoader.classList.add("hidden");
};
