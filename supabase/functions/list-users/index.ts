// supabase-edge-functions/list-users-with-profiles.ts
import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.44.0";
import { corsHeaders } from "../_shared/cors.ts";

// Cliente Supabase para o usuário logado
const getSupabaseClient = (authHeader: string) =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

// Cliente Supabase com permissões de administrador
const getSupabaseAdminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

// Verifica se o usuário autenticado tem a role 'admin'
async function isAdmin(supabaseClient: SupabaseClient) {
  console.log("Verificando permissão de admin...");
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    throw new Error(
      "Acesso negado: somente administradores podem listar usuários.",
    );
  }

  console.log("Verificação de admin passou.");
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Token inválido ou ausente.");
    }

    // Verifica se o usuário é admin
    const userSupabaseClient = getSupabaseClient(authHeader);
    await isAdmin(userSupabaseClient);

    // Cria cliente admin
    const supabaseAdmin = getSupabaseAdminClient();

    // Lista usuários autenticados
    const {
      data: { users },
      error: authError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Erro ao listar usuários da autenticação:", authError);
      throw authError;
    }

    // Busca perfis no banco
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, role, status");

    if (profilesError) {
      console.error("Erro ao buscar perfis:", profilesError);
      throw profilesError;
    }

    // Junta perfis e autenticação
    const usersWithProfiles = users
      .map((user) => {
        const profile = profiles.find((p) => p.id === user.id);
        if (!profile) {
          console.warn(`Perfil não encontrado para o usuário ${user.id}`);
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          full_name: profile.full_name,
          role: profile.role,
          status: profile.status,
        };
      })
      .filter(Boolean); // Remove nulls

    console.log("Lista de usuários obtida com sucesso.");
    return new Response(JSON.stringify(usersWithProfiles), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("ERRO CAPTURADO NA FUNÇÃO:", error);
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    const status =
      message.includes("Acesso negado") || message.includes("ausente")
        ? 403
        : 500;
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
