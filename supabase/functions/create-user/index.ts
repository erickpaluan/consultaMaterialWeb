import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Tratamento para requisição OPTIONS (necessário para CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Cria um cliente Supabase com privilégios de administrador
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Pega os dados do novo usuário vindos do frontend
    const { email, password, fullName, role } = await req.json()

    // 3. Validação básica
    if (!email || !password || !fullName || !role) {
      throw new Error('Campos obrigatórios ausentes.');
    }

    // 4. Cria o usuário no sistema de autenticação do Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // O usuário é criado como confirmado
      user_metadata: {
        full_name: fullName,
        role: role,
      },
    })

    if (authError) {
      console.error('Erro ao criar usuário na autenticação:', authError);
      throw authError;
    }
    
    // Garante que o cargo e nome sejam definidos corretamente no perfil
    const newUser = authData.user;
    if (newUser) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: fullName,
          role: role,
        })
        .eq('id', newUser.id);
      
      if (profileError) {
        console.error('Usuário criado na autenticação, mas falha ao atualizar perfil:', profileError);
        // Em um cenário real, você poderia deletar o usuário recém-criado para evitar inconsistência
        throw profileError;
      }
    }

    // 5. Retorna sucesso
    return new Response(JSON.stringify({ message: 'Usuário criado com sucesso!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // Retorna erro
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})