// Edge Function `aceitar-troca` — aceite de uma troca de colecionáveis (RF22, RN18, RN19).
// Toda a conferência e a troca acontecem DENTRO do banco, numa única transação (função aceitar_troca):
// ou os dois itens trocam de dono, ou nenhum troca.
import { autenticar, CABECALHOS_CORS, responder } from "../_shared/cliente.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CABECALHOS_CORS });
  if (req.method !== "POST") return responder({ erro: "Use POST." }, 405);

  // 1) AUTENTICAR
  const auth = await autenticar(req);
  if (auth instanceof Response) return auth;
  const { usuario, admin } = auth;

  // 2) VALIDAR
  const corpo = await req.json().catch(() => ({}));
  const trocaId = String(corpo?.troca_id ?? "");
  if (!UUID.test(trocaId)) return responder({ erro: "Troca inválida." }, 400);

  // 3) E 4) REGRA + GRAVAR — o destinatário é SEMPRE quem está logado (vem do token, não do corpo),
  // assim ninguém aceita a troca de outra pessoa (RN18).
  const { error } = await admin.rpc("aceitar_troca", { p_troca: trocaId, p_destinatario: usuario.id });
  if (error) {
    // As mensagens vêm das regras do banco (ex.: "Só é possível trocar cópias repetidas").
    return responder({ erro: error.message }, 409);
  }

  // 5) RESPONDER
  return responder({ ok: true });
});
