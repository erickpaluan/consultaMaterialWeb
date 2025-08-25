import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Autorização necessária." }),
        { status: 401, headers: corsHeaders },
      );
    }

    // Cliente para validar se o usuário é admin
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      },
    );

    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado." }),
        { status: 401, headers: corsHeaders },
      );
    }

    // Verifica se é admin
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Acesso negado: apenas admin." }),
        { status: 403, headers: corsHeaders },
      );
    }

    // Cria cliente admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    console.log("Corpo recebido:", body);

    const { userId, role, status } = body;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "ID do usuário obrigatório." }),
        { status: 400, headers: corsHeaders },
      );
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: "Nenhum campo para atualizar." }),
        { status: 400, headers: corsHeaders },
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (updateError) {
      console.error(
        "Erro ao atualizar usuário:",
        JSON.stringify(updateError, null, 2),
      );
      return new Response(
        JSON.stringify({
          error: "Erro ao atualizar o usuário.",
          details: updateError.message,
        }),
        { status: 500, headers: corsHeaders },
      );
    }

    return new Response(
      JSON.stringify({ message: "Usuário atualizado com sucesso." }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error("Erro inesperado:", err);
    return new Response(JSON.stringify({ error: "Erro interno na função." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
