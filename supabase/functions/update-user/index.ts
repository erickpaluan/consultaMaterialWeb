// supabase/functions/update-user/index.ts
// Nota: O helper isAdmin e a configuração inicial são idênticos à função list-users
// Em um projeto maior, você poderia compartilhar essa lógica.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import { corsHeaders } from '../_shared/cors.ts'

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    if (!await isAdmin(supabase)) {
      throw new Error('Acesso negado.');
    }
    
    const { userId, role, status } = await req.json();
    if (!userId || (!role && !status)) {
      throw new Error('Dados insuficientes para a atualização.');
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const updateData = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;
    
    return new Response(JSON.stringify({ message: 'Usuário atualizado com sucesso.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})