// Regras de XP e nível do OASYS (RF15, RN02, RN20).
// Este arquivo só CALCULA. Quem CONCEDE XP é a Edge Function no servidor (RN02),
// o navegador nunca grava XP.

/** Nível máximo da plataforma (RN20). */
export const NIVEL_MAXIMO = 100;

/** XP concedido por check-in diário (RF16). */
export const XP_CHECKIN = 15;

/** Bônus de XP ao completar 7 check-ins na mesma semana, de domingo a sábado (RN03). */
export const XP_BONUS_SEMANA = 100;

/**
 * XP acumulado em que o nível N começa: N · (N − 1) (RN20).
 * Ex.: nível 2 começa em 2 XP; nível 100 em 9.900 XP (o teto). Quem faz só o check-in
 * todo dia (15 XP + 100 XP por semana completa) chega lá em cerca de 11 meses.
 */
export function xpDoNivel(nivel: number): number {
  if (nivel <= 1) return 0;
  return nivel * (nivel - 1);
}

/** Maior nível N (de 1 a 100) tal que xpDoNivel(N) <= xp. */
export function calcularNivel(xp: number): number {
  const xpSeguro = Math.max(0, xp);
  let nivel = 1;
  while (nivel < NIVEL_MAXIMO && xpDoNivel(nivel + 1) <= xpSeguro) nivel++;
  return nivel;
}

export interface ProgressoDeXp {
  nivel: number;
  xpNoNivel: number; // XP em que o nível atual começou
  xpProximoNivel: number | null; // null no nível máximo
  percentual: number; // 0 a 100, para a barra de progresso
  faltam: number; // XP que faltam para o próximo nível
}

/** Dados prontos para desenhar a barra de XP do perfil e da home. */
export function progressoDeXp(xp: number): ProgressoDeXp {
  const nivel = calcularNivel(xp);
  const xpNoNivel = xpDoNivel(nivel);
  if (nivel >= NIVEL_MAXIMO) {
    return { nivel, xpNoNivel, xpProximoNivel: null, percentual: 100, faltam: 0 };
  }
  const xpProximoNivel = xpDoNivel(nivel + 1);
  const percentual = ((xp - xpNoNivel) / (xpProximoNivel - xpNoNivel)) * 100;
  return {
    nivel,
    xpNoNivel,
    xpProximoNivel,
    percentual: Math.min(100, Math.max(0, percentual)),
    faltam: Math.max(0, xpProximoNivel - xp),
  };
}
