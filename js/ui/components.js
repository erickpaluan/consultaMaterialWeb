import { getState } from "../state.js";

function createActionButtons(item) {
  const { currentUser } = getState();
  const isAdmin = currentUser?.role === "admin";

  const historyIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>`;
  const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>`;
  const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" /></svg>`;

  const adminButtons = isAdmin
    ? `
        <button title="Editar" data-id="${item.id}" class="edit-btn text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-gray-100 transition-colors">${editIcon}</button>
        ${
          !item.reservado
            ? `
            <button title="Excluir" data-id="${item.id}" data-numero="${item.numero}" class="delete-btn text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors">${deleteIcon}</button>
        `
            : ""
        }
    `
    : "";

  return `
        <div class="flex items-center justify-center space-x-2">
            <button title="Histórico" data-id="${item.id}" class="history-btn text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors">${historyIcon}</button>
            ${adminButtons}
            <button data-id="${item.id}" data-quantidade="${item.quantidade}" class="reserve-btn bg-blue-500 text-white px-3 py-1 text-sm rounded-md shadow-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1" ${item.quantidade === 0 ? "disabled" : ""}>
                <span>Reservar</span>
            </button>
        </div>
    `;
}

export function createRetalhoTableRow(item) {
  const row = document.createElement("tr");
  row.className = "hover:bg-gray-50";
  const statusIndicator = item.reservado
    ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800" title="Este item possui uma ou mais reservas">Reservado</span>`
    : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Disponível</span>`;
  row.innerHTML = `<td class="p-3 text-center font-medium">${item.numero}</td><td class="p-3 text-center">${item.gaveta}</td><td class="p-3 text-center">${item.material}</td><td class="p-3 text-center">${item.tipo}</td><td class="p-3 text-center">${item.comprimento}m x ${item.largura}m x ${item.espessura}mm</td><td class="p-3 text-center">${item.quantidade}</td><td class="p-3 text-center">${statusIndicator}</td><td class="p-3 text-center actions-cell">${createActionButtons(item)}</td>`;
  return row;
}

export function createRetalhoCard(item) {
  const card = document.createElement("div");
  card.className =
    "bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3";
  const statusIndicator = item.reservado
    ? `<p class="text-sm font-semibold text-yellow-700">&#x25cf; Reservado</p>`
    : `<p class="text-sm font-semibold text-green-700">&#x25cf; Disponível</p>`;
  card.innerHTML = `<div class="flex justify-between items-center"><div><p class="font-bold text-lg text-gray-900">Nº: ${item.numero}</p><p class="text-sm text-gray-500">Gaveta: ${item.gaveta}</p></div><div>${statusIndicator}</div></div><div class="text-gray-700 border-t pt-3"><p><strong>Material:</strong> ${item.material} - ${item.tipo}</p><p><strong>Medidas:</strong> ${item.comprimento}m x ${item.largura}m x ${item.espessura}mm</p><p><strong>Quantidade:</strong> ${item.quantidade}</p>${item.obs ? `<p class="text-sm mt-1"><strong>Obs:</strong> ${item.obs}</p>` : ""}</div><div class="pt-2 actions-cell">${createActionButtons(item)}</div>`;
  return card;
}

export function createReservedItemsTable(data) {
  const table = document.createElement("table");
  table.className = "min-w-full divide-y divide-gray-200 text-sm";
  table.innerHTML = `
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retalho</th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
          <th scope="col" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider actions-cell-pdf">Ações</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        ${data
          .map((item) => {
            const retalho = item.retalhos;
            if (!retalho) return "";
            const dataReserva = new Date(item.data_reserva).toLocaleDateString(
              "pt-BR",
            );
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-4 whitespace-nowrap"><div class="font-semibold">${item.numero_os}</div><div class="text-gray-500">${dataReserva}</div></td>
                    <td class="px-4 py-4 whitespace-nowrap">Nº ${retalho.numero} (Gaveta: ${retalho.gaveta})</td>
                    <td class="px-4 py-4 whitespace-nowrap">${retalho.material} - ${retalho.tipo}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-center actions-cell-pdf">
                        <div class="flex justify-center items-center gap-3">
                            <button class="cancel-btn text-blue-600 hover:text-blue-800 font-medium" title="Cancelar Reserva e Retornar ao Estoque" data-reserva-id="${item.id}" data-retalho-id="${retalho.id}" data-quantidade-reservada="${item.quantidade_reservada}">Retornar</button>
                            <button class="baixa-btn bg-green-600 text-white px-3 py-1 text-sm rounded-md shadow-sm hover:bg-green-700" title="Confirmar Uso e Remover do Sistema" data-reserva-id="${item.id}" data-retalho-id="${retalho.id}" data-os="${item.numero_os}" data-numero="${retalho.numero}">Dar Baixa</button>
                        </div>
                    </td>
                </tr>
            `;
          })
          .join("")}
      </tbody>`;
  return table;
}

export function createHistoryLog(logs) {
  if (!logs || logs.length === 0) {
    return '<p class="text-gray-500">Nenhum histórico encontrado para este item.</p>';
  }
  return `<ul class="space-y-4">${logs
    .map(
      (log) => `
        <li class="flex items-start space-x-3">
            <div class="flex-shrink-0"><div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500" title="${log.user_email}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg></div></div>
            <div>
                <p class="text-sm text-gray-800"><span class="font-bold">${log.acao}</span> por <span class="font-medium">${log.user_email}</span></p>
                ${log.detalhes ? `<p class="text-sm text-gray-600 bg-gray-50 p-2 rounded-md mt-1">${log.detalhes}</p>` : ""}
                <p class="text-xs text-gray-400 mt-1">${new Date(log.created_at).toLocaleString("pt-BR")}</p>
            </div>
        </li>
    `,
    )
    .join("")}</ul>`;
}
