// supabase/functions/list-users/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import { corsHeaders } from '../_shared/cors.ts'

// Função para verificar se o requisitante é um admin
async function isAdmin(supabaseClient) {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profileError) throw profileError;
  return profile.role === 'admin';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Cliente padrão para verificar a permissão do usuário que fez a chamada
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verifica se o usuário é admin
    if (!await isAdmin(supabase)) {
      throw new Error('Acesso negado: somente administradores podem listar usuários.');
    }

    // Se for admin, usa o cliente com SERVICE_ROLE_KEY para buscar todos os perfis
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { data, error } = await supabaseAdmin.from('profiles').select('id, full_name, email, role, status');
    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401, // Unauthorized ou Bad Request
    })
  }
})