// Edge Function `girar-roleta` — roleta do Santuário (RF17, RN04, RN14, RNF05).
// O usuário escolhe um jogo; o servidor sorteia uma arte daquele jogo, ponderada por raridade,
// e grava em user_collection. Limite: 3 giros por "dia de giro" (21h a 21h, Brasília).
import { autenticar, CABECALHOS_CORS, responder } from "../_shared/cliente.ts";
import { diaDeGiro } from "../_shared/datas.ts";
import { MAXIMO_GIROS_POR_DIA, sortearPorRaridade } from "../_shared/regras.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CABECALHOS_CORS });
  if (req.method !== "POST") return responder({ erro: "Use POST." }, 405);

  // 1) AUTENTICAR
  const auth = await autenticar(req);
  if (auth instanceof Response) return auth;
  const { usuario, admin } = auth;

  // 2) VALIDAR a entrada: precisa vir um game_id no formato certo.
  const corpo = await req.json().catch(() => ({}));
  const gameId = String(corpo?.game_id ?? "");
  if (!UUID.test(gameId)) return responder({ erro: "Escolha um jogo válido." }, 400);

  // O jogo precisa ter artes cadastradas. Conferimos ANTES de gastar o giro,
  // para o usuário não perder um giro por erro nosso.
  const { data: artes } = await admin.from("collectibles").select("id, title, image_url, rarity").eq("game_id", gameId);
  if (!artes || artes.length === 0) return responder({ erro: "Este jogo não tem artes disponíveis." }, 400);

  // 3) REGRA — gasta um giro com UMA operação atômica no banco (função gastar_giro).
  // Se dez requisições chegarem juntas, só as 3 primeiras passam (RNF05).
  const diaGiro = diaDeGiro();
  const { data: usados, error: erroGiro } = await admin.rpc("gastar_giro", {
    p_usuario: usuario.id,
    p_dia_de_giro: diaGiro,
  });
  if (erroGiro) return responder({ erro: "Não foi possível girar agora." }, 500);
  if (usados === null) {
    return responder({ erro: "Você já usou os 3 giros. Eles voltam às 21h (Brasília).", giros_restantes: 0 }, 403);
  }

  // Sorteio ponderado por raridade, decidido AQUI no servidor (RN14).
  const arte = sortearPorRaridade(artes, Math.random)!;

  // 4) GRAVAR — entrega a arte. Se já tinha, vira "repetida" (quantity + 1), que pode ser trocada (RN18).
  const { data: nova, error: erroArte } = await admin.rpc("dar_colecionavel", {
    p_usuario: usuario.id,
    p_colecionavel: arte.id,
  });
  if (erroArte) return responder({ erro: "Não foi possível entregar a arte." }, 500);

  // 5) RESPONDER
  return responder({
    arte,
    repetida: nova === false,
    giros_usados: usados,
    giros_restantes: MAXIMO_GIROS_POR_DIA - usados,
  });
});
