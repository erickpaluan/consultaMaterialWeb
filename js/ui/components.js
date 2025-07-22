export function createRetalhoTableRow(item) {
  const row = document.createElement('tr');
  row.className = 'border-b border-gray-200 hover:bg-gray-50';
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
      ${item.reservado && item.quantidade > 0 ? `<span class="text-yellow-700 text-sm" title="Reservado">&#x25cf;</span>` : ""}
      <button data-id="${item.id}" data-quantidade="${item.quantidade}" class="reserve-btn bg-blue-500 text-white px-3 py-1 text-sm rounded-md shadow-sm hover:bg-blue-600 ${item.quantidade === 0 ? "opacity-50 cursor-not-allowed" : ""}" ${item.quantidade === 0 ? "disabled" : ""}>
        Reservar
      </button>
    </td>`;
  return row;
}

export function createRetalhoCard(item) {
  const card = document.createElement('div');
  card.className = 'bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-2';
  card.innerHTML = `
    <div class="flex justify-between items-center font-bold text-lg">
      <span>Nº: ${item.numero}</span>
      <span class="text-sm font-medium text-gray-600">Gaveta: ${item.gaveta}</span>
    </div>
    <div class="text-gray-700">
      <p><strong>Material:</strong> ${item.material} - ${item.tipo}</p>
      <p><strong>Medidas:</strong> ${item.comprimento}m x ${item.largura}m x ${item.espessura}mm</p>
      <p><strong>Quantidade:</strong> ${item.quantidade}</p>
      ${item.obs ? `<p><strong>Obs:</strong> ${item.obs}</p>` : ""}
      ${item.reservado && item.quantidade > 0 ? `<p class="text-yellow-700 font-bold" title="Reservado">&#x25cf; Reservado</p>` : ""}
    </div>
    <div class="pt-2">
      <button data-id="${item.id}" data-quantidade="${item.quantidade}" class="reserve-btn w-full bg-blue-500 text-white py-2 rounded-md shadow-sm hover:bg-blue-600 ${item.quantidade === 0 ? "opacity-50 cursor-not-allowed" : ""}" ${item.quantidade === 0 ? "disabled" : ""}>
        Reservar
      </button>
    </div>`;
  return card;
}

export function createReservedItemsTable(data) {
    const table = document.createElement("table");
    table.className = "w-full table-auto border-collapse mt-4 text-sm text-gray-700 rounded-md overflow-hidden shadow-md";
    table.innerHTML = `
      <thead class="bg-gray-200 text-left font-bold">
        <tr>
          <th class="p-3">Nº Retalho</th><th class="p-3">OS</th><th class="p-3">Material</th><th class="p-3">Medidas (m)</th>
          <th class="p-3">Esp. (mm)</th><th class="p-3">Qtd. Reserv.</th><th class="p-3">Gaveta</th>
          <th class="p-3">Data Reserva</th><th class="p-3">Ações</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        ${data.map(item => createReservedItemRow(item)).join('')}
      </tbody>`;
    return table;
}

function createReservedItemRow(item) {
    const retalho = item.retalhos;
    if (!retalho) return ''; // Proteção caso o retalho associado tenha sido deletado
    const dataReserva = item.data_reserva ? new Date(item.data_reserva).toLocaleDateString("pt-BR") : "N/A";
    return `
      <tr class="hover:bg-gray-50 transition-colors duration-200">
        <td class="p-3">${retalho.numero}</td><td class="p-3">${item.numero_os}</td>
        <td class="p-3">${retalho.material} - ${retalho.tipo}</td><td class="p-3">${retalho.comprimento} x ${retalho.largura}</td>
        <td class="p-3">${retalho.espessura}</td><td class="p-3">${item.quantidade_reservada}</td>
        <td class="p-3">${retalho.gaveta}</td><td class="p-3">${dataReserva}</td>
        <td class="p-3">
          <button class="cancel-btn text-red-500 hover:text-red-700 text-lg" title="Cancelar" data-reserva-id="${item.id}" data-retalho-id="${retalho.id}" data-quantidade-reservada="${item.quantidade_reservada}">
            &#x21BA;
          </button>
        </td>
      </tr>`;
}