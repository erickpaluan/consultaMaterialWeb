import { supabase } from "./supabaseClient.js";

export async function fetchRetalhos(filters, pagination, sort) {
  let query = supabase
    .from("retalhos")
    .select("*", { count: "exact" })
    .gt("quantidade", 0)
    .order(sort.column, { ascending: sort.direction });

  if (filters.material) query = query.eq("material", filters.material);
  if (filters.tipo) query = query.eq("tipo", filters.tipo);
  if (filters.espessura) query = query.eq("espessura", filters.espessura);
  if (filters.largura && !isNaN(parseFloat(filters.largura)))
    query = query.gte("largura", parseFloat(filters.largura));
  if (filters.altura && !isNaN(parseFloat(filters.altura)))
    query = query.gte("comprimento", parseFloat(filters.altura));

  if (filters.textSearch && filters.textSearch.length > 0) {
    const searchConditions = filters.textSearch
      .map((term) => `or(material.ilike.%${term}%,tipo.ilike.%${term}%)`)
      .join(",");
    query = query.or(searchConditions);
  }

  if (pagination.itemsPerPage !== -1) {
    const from = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const to = from + pagination.itemsPerPage - 1;
    query = query.range(from, to);
  }

  return await query;
}

// --- O resto do arquivo api.js permanece o mesmo ---
export async function deleteRetalho(retalhoId) {
  return await supabase.from("retalhos").delete().eq("id", retalhoId);
}
export async function checkForExistingRetalho(retalho) {
  const { data, error } = await supabase
    .from("retalhos")
    .select("*")
    .eq("material", retalho.material)
    .eq("tipo", retalho.tipo)
    .eq("espessura", retalho.espessura)
    .eq("comprimento", retalho.comprimento)
    .eq("largura", retalho.largura)
    .maybeSingle();
  if (error) {
    console.error("Erro ao verificar retalho existente:", error);
    return null;
  }
  return data;
}
export async function fetchFullRetalhoById(id) {
  return await supabase.from("retalhos").select("*").eq("id", id).single();
}
export async function registrarAuditoria(logData) {
  const { error } = await supabase.from("auditoria_retalhos").insert(logData);
  if (error) {
    console.error("Falha ao registrar auditoria:", error);
  }
}
export async function fetchAuditoriaPorRetalhoId(retalhoId) {
  return await supabase
    .from("auditoria_retalhos")
    .select("*")
    .eq("retalho_id", retalhoId)
    .order("created_at", { ascending: false });
}
export async function createRetalho(novoRetalho) {
  return await supabase
    .from("retalhos")
    .insert([novoRetalho])
    .select()
    .single();
}
export async function fetchDistinctField(field, order = true) {
  return await supabase
    .from("retalhos")
    .select(field)
    .order(field, { ascending: order });
}
export async function fetchDistinctFieldWhere(
  field,
  whereClause,
  order = true
) {
  let query = supabase.from("retalhos").select(field);
  for (const key in whereClause) {
    if (whereClause[key]) query = query.eq(key, whereClause[key]);
  }
  return await query.order(field, { ascending: order });
}
export async function fetchRetalhoById(id) {
  return await supabase
    .from("retalhos")
    .select("quantidade")
    .eq("id", id)
    .single();
}
export async function fetchReservationsByRetalhoId(retalhoId) {
  return await supabase
    .from("reservas")
    .select("id")
    .eq("retalho_id", retalhoId);
}
export async function updateRetalho(id, updateData) {
  return await supabase.from("retalhos").update(updateData).eq("id", id);
}
export async function createReserva(reservaData) {
  return await supabase.from("reservas").insert(reservaData);
}
export async function fetchAllReservations(searchTerm = "") {
  let query = supabase
    .from("reservas")
    .select(`id, numero_os, quantidade_reservada, data_reserva, retalhos(*)`)
    .order("data_reserva", { ascending: false });
  if (searchTerm) query = query.ilike("numero_os", `%${searchTerm}%`);
  return await query;
}
export async function deleteReserva(reservaId) {
  return await supabase.from("reservas").delete().eq("id", reservaId);
}
