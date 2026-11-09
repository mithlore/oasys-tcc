// Edge Function `checkin` — check-in diário (RF16, RN02, RN03, RF15).
// Concede +15 XP por dia. No 7º check-in da mesma semana (domingo a sábado) concede +100 XP e uma
// arte rara/épica; ao completar todos os dias do mês, uma arte lendária.
// Roda no servidor para o usuário não burlar nada pelo navegador (RNF02).
import { autenticar, CABECALHOS_CORS, responder } from "../_shared/cliente.ts";
import { diasNoMes, hojeEmBrasilia, inicioDaSemana, mesDaData, somarDias } from "../_shared/datas.ts";
import {
  RARIDADES_MES,
  RARIDADES_SEMANA,
  recompensasDoCheckin,
  sortearUm,
  type Raridade,
} from "../_shared/regras.ts";

const XP_CHECKIN = 15; // XP por check-in (RF16)
const XP_BONUS_SEMANA = 100; // bônus da semana completa (RN03)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CABECALHOS_CORS });
  if (req.method !== "POST") return responder({ erro: "Use POST." }, 405);

  // 1) AUTENTICAR
  const auth = await autenticar(req);
  if (auth instanceof Response) return auth;
  const { usuario, admin } = auth;

  // 2) VALIDAR — esta função não recebe dados: o "dia" é sempre o do servidor, em Brasília (RN03).
  const hoje = hojeEmBrasilia();
  const semana = inicioDaSemana(hoje); // domingo da semana atual
  const mes = mesDaData(hoje);

  // 3) E 4) REGRA + GRAVAR — a chave (user_id, day) impede dois check-ins no mesmo dia,
  // mesmo com duas requisições ao mesmo tempo: o banco recusa a segunda (erro 23505).
  const { error: erroLog } = await admin
    .from("daily_logs")
    .insert({ user_id: usuario.id, day: hoje, week_start: semana });
  if (erroLog) {
    if (erroLog.code === "23505") return responder({ ja_fez_checkin: true, dia: hoje });
    return responder({ erro: "Não foi possível registrar o check-in." }, 500);
  }

  // XP do dia. A função SQL soma o XP, recalcula o nível e registra em xp_events.
  let xpGanho = XP_CHECKIN;
  await admin.rpc("conceder_xp", { p_usuario: usuario.id, p_motivo: "checkin_diario", p_quantidade: XP_CHECKIN });

  // Conta os check-ins da semana e do mês (já incluindo o de agora) para ver se completou.
  const { count: diasNaSemana } = await admin
    .from("daily_logs").select("*", { count: "exact", head: true })
    .eq("user_id", usuario.id).eq("week_start", semana);
  const { count: diasNoMesFeitos } = await admin
    .from("daily_logs").select("*", { count: "exact", head: true })
    .eq("user_id", usuario.id).gte("day", `${mes}-01`).lte("day", somarDias(`${mes}-01`, diasNoMes(mes) - 1));

  const extras = recompensasDoCheckin({
    diasNaSemana: diasNaSemana ?? 0,
    diasNoMesFeitos: diasNoMesFeitos ?? 0,
    diasDoMes: diasNoMes(mes),
  });

  // Sorteia entre as artes que o usuário ainda NÃO tem (RN03) e entrega.
  async function sortearArteQueFalta(raridades: Raridade[]) {
    const { data: possui } = await admin.from("user_collection").select("collectible_id").eq("user_id", usuario.id);
    const jaTem = new Set((possui ?? []).map((c) => c.collectible_id));
    const { data: artes } = await admin.from("collectibles").select("id, title, image_url, rarity").in("rarity", raridades);
    const candidatas = (artes ?? []).filter((a) => !jaTem.has(a.id));
    const escolhida = sortearUm(candidatas, Math.random);
    if (!escolhida) return null; // já tem todas (ou não há artes cadastradas)
    await admin.rpc("dar_colecionavel", { p_usuario: usuario.id, p_colecionavel: escolhida.id });
    return escolhida;
  }

  let arteSemana = null;
  let arteMes = null;
  if (extras.semanaCompleta) {
    await admin.rpc("conceder_xp", { p_usuario: usuario.id, p_motivo: "semana_completa", p_quantidade: XP_BONUS_SEMANA });
    xpGanho += XP_BONUS_SEMANA;
    arteSemana = await sortearArteQueFalta(RARIDADES_SEMANA);
  }
  if (extras.mesCompleto) arteMes = await sortearArteQueFalta(RARIDADES_MES);

  // 5) RESPONDER — devolve o perfil atualizado para a tela mostrar o novo XP e nível.
  const { data: perfil } = await admin.from("profiles").select("xp, level").eq("id", usuario.id).single();
  return responder({
    ja_fez_checkin: false,
    dia: hoje,
    xp_ganho: xpGanho,
    xp_total: perfil?.xp,
    nivel: perfil?.level,
    dias_na_semana: diasNaSemana,
    semana_completa: extras.semanaCompleta,
    arte_semana: arteSemana,
    mes_completo: extras.mesCompleto,
    arte_mes: arteMes,
  });
});
