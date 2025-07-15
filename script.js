import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://rlgsehxrpkxlavxdpzgz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ3NlaHhycGt4bGF2eGRwemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTY2MjgsImV4cCI6MjA2ODE3MjYyOH0.S_doyB0_3GuKRWCb0RXOXzTBvhsiEp_l9X0kWMt86Xg'
);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('filter-form');
  const materialSelect = document.getElementById('material');
  const tipoSelect = document.getElementById('tipo');
  const espessuraInput = document.getElementById('espessura');
  const larguraInput = document.getElementById('largura');
  const alturaInput = document.getElementById('altura');

  const resultsTableBody = document.getElementById('tabela-retalhos-body');
  const resultsCardsContainer = document.getElementById('cards-container');
  const loader = document.getElementById('loader');
  const emptyState = document.getElementById('empty-state');
  const resultsContainer = document.getElementById('results-container');

  const carregarTipos = async () => {
    const material = materialSelect.value;
    if (!material) {
      tipoSelect.innerHTML = '<option value="">Todos os Tipos</option>';
      return;
    }

    const { data } = await supabase
      .from("retalhos")
      .select("tipo")
      .eq("material", material)
      .neq("reservado", true);

    const tiposUnicos = [...new Set((data || []).map(t => t.tipo))].sort();

    tipoSelect.innerHTML = '<option value="">Todos os Tipos</option>';
    tiposUnicos.forEach(tipo => {
      if (tipo) {
        const opt = document.createElement("option");
        opt.value = tipo;
        opt.textContent = tipo;
        tipoSelect.appendChild(opt);
      }
    });
  };

  const carregarMateriais = async () => {
    const { data } = await supabase
      .from("retalhos")
      .select("material")
      .neq("reservado", true);

    const materiaisUnicos = [...new Set((data || []).map(m => m.material))].sort();

    materialSelect.innerHTML = '<option value="">Todos</option>';
    materiaisUnicos.forEach(mat => {
      if (mat) {
        const opt = document.createElement("option");
        opt.value = mat;
        opt.textContent = mat;
        materialSelect.appendChild(opt);
      }
    });
  };

  const carregarRetalhos = async () => {
    loader.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    emptyState.classList.add('hidden');

    const material = materialSelect.value;
    const tipo = tipoSelect.value;
    const espessura = parseFloat(espessuraInput.value);
    const largura = parseFloat(larguraInput.value);
    const altura = parseFloat(alturaInput.value);

    let query = supabase.from('retalhos').select('*').eq('reservado', false);
    if (material) query = query.eq('material', material);
    if (tipo) query = query.eq('tipo', tipo);
    if (!isNaN(espessura)) query = query.eq('espessura', espessura);
    if (!isNaN(largura)) query = query.gte('largura', largura);
    if (!isNaN(altura)) query = query.gte('comprimento', altura);

    try {
      const { data, error } = await query.order('numero', { ascending: true });

      if (error) throw error;

      resultsTableBody.innerHTML = "";
      resultsCardsContainer.innerHTML = "";

      if (!data.length) {
        emptyState.classList.remove('hidden');
      } else {
        renderResults(data);
        resultsContainer.classList.remove('hidden');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível carregar os retalhos.' });
    } finally {
      loader.classList.add('hidden');
    }
  };

  const renderResults = (data) => {
    data.forEach(item => {
      const row = document.createElement("tr");
      row.className = "border-b border-gray-200 hover:bg-gray-50";
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
          <button data-id="${item.id}" class="reserve-btn bg-blue-500 text-white px-3 py-1 text-sm rounded-md shadow-sm hover:bg-blue-600">Reservar</button>
        </td>`;
      resultsTableBody.appendChild(row);

      const card = document.createElement("div");
      card.className = "bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-2";
      card.innerHTML = `
        <div class="flex justify-between items-center font-bold text-lg">
          <span>Nº: ${item.numero}</span>
          <span class="text-sm font-medium text-gray-600">Gaveta: ${item.gaveta}</span>
        </div>
        <div class="text-gray-700">
          <p><strong>Material:</strong> ${item.material} - ${item.tipo}</p>
          <p><strong>Medidas:</strong> ${item.comprimento}m x ${item.largura}m x ${item.espessura}mm</p>
          <p><strong>Quantidade:</strong> ${item.quantidade}</p>
          <p><strong>Obs:</strong> ${item.obs || "N/A"}</p>
        </div>
        <div class="pt-2">
          <button data-id="${item.id}" class="reserve-btn w-full bg-blue-500 text-white py-2 rounded-md shadow-sm hover:bg-blue-600">Reservar</button>
        </div>`;
      resultsCardsContainer.appendChild(card);
    });
  };

  const pedirOS = async (id) => {
    const { value: os } = await Swal.fire({
      title: 'Informe a OS',
      input: 'text',
      inputLabel: 'Número da Ordem de Serviço',
      inputPlaceholder: 'Digite o número da OS...',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonText: 'Cancelar'
    });

    if (!os) return;

    const { error } = await supabase
      .from('retalhos')
      .update({ reservado: true, os, data_reserva: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      Swal.fire({ icon: 'error', text: 'Erro ao reservar o retalho.' });
    } else {
      Swal.fire({ icon: 'success', text: 'Retalho reservado com sucesso!', timer: 1500, showConfirmButton: false });
      carregarRetalhos();
    }
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    carregarRetalhos();
  });

  materialSelect.addEventListener('change', carregarTipos);

  resultsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('reserve-btn')) {
      pedirOS(e.target.dataset.id);
    }
  });

  carregarMateriais();
  carregarTipos();
  carregarRetalhos();
});
