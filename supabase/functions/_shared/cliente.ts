// Utilidades comuns às Edge Functions (Deno): autenticação, clientes do Supabase e respostas.
// Cada função segue as 5 etapas: 1) autenticar, 2) validar, 3) regra, 4) gravar, 5) responder.
import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

/** Cabeçalhos CORS: deixam o site (outro endereço) chamar a função pelo navegador. */
export const CABECALHOS_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Resposta JSON padrão (sucesso ou erro). */
export function responder(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CABECALHOS_CORS, "Content-Type": "application/json" },
  });
}

/**
 * ETAPA 1 — Autenticar. Descobre quem está chamando a partir do token (JWT) que o navegador envia.
 * Devolve o usuário e um cliente "admin" (service_role), que só existe aqui no servidor
 * e é o único que pode conceder XP, giros e colecionáveis (RN02, RNF02).
 */
export async function autenticar(req: Request): Promise<{ usuario: User; admin: SupabaseClient } | Response> {
  const cabecalho = req.headers.get("Authorization") ?? "";
  const token = cabecalho.replace("Bearer ", "");
  if (!token) return responder({ erro: "Faça login para continuar." }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  // A chave de serviço é um "secret" do Supabase: nunca vai para o navegador nem para o Git.
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  // Pergunta ao Supabase Auth se o token é válido e de quem é.
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return responder({ erro: "Sessão inválida. Entre novamente." }, 401);
  return { usuario: data.user, admin };
}
