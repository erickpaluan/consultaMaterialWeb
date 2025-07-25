export function createRetalhoTableRow(item, userRole) {
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
    <td class="p-3 text-center actions-cell">${createActionButtons(item, userRole)}</td>`;
  return row;
}

export function createRetalhoCard(item, userRole) {
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
    <div class="pt-2 border-t mt-2 actions-cell">${createActionButtons(item, userRole)}</div>`;
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
function createActionButtons(item, userRole) {
    const isAdmin = userRole === 'admin';
    return `
        <div class="flex items-center justify-center space-x-2">
            <button title="Histórico" data-id="${item.id}" class="history-btn text-gray-500 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
            </button>
            ${isAdmin ? `<button title="Editar" data-id="${item.id}" class="edit-btn text-gray-500 hover:text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
            </button>` : ''}
            <button data-id="${item.id}" data-quantidade="${item.quantidade}" class="reserve-btn text-white bg-blue-500 hover:bg-blue-600 rounded-full p-1 leading-none" title="Reservar">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg>
            </button>
        </div>
    `;
}

export function createHistoryLog(logs) {
    if (!logs || logs.length === 0) {
        return '<p class="text-gray-500">Nenhum histórico encontrado para este item.</p>';
    }

    return `
        <ul class="space-y-4">
            ${logs.map(log => `
                <li class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500" title="${log.user_email}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm text-gray-800">
                            <span class="font-bold">${log.acao}</span> por ${log.user_email}
                        </p>
                        ${log.detalhes ? `<p class="text-sm text-gray-600">${log.detalhes}</p>` : ''}
                        <p class="text-xs text-gray-400">${new Date(log.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}