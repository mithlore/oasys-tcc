// Regras puras das Edge Functions de check-in e roleta (RN03, RN04, RN14).
// "Pura" = só recebe valores e devolve valores, sem acessar banco nem internet.
// Por isso dá para testar tudo com `npm test` e explicar na banca.

/** Giros por dia de giro (RN04). O banco também limita a 3 com um `check`. */
export const MAXIMO_GIROS_POR_DIA = 3;

/** Dias de check-in numa semana (domingo a sábado) para ganhar o bônus (RN03). */
export const DIAS_PARA_BONUS_SEMANAL = 7;

export type Raridade = "comum" | "rara" | "epica" | "lendaria";

/**
 * Peso de cada raridade no sorteio da roleta (RN14). Quanto maior o peso, mais provável.
 * Valores herdados da versão anterior do OASYS (60/25/10/5) — os autores podem ajustar aqui.
 */
export const PESO_POR_RARIDADE: Record<Raridade, number> = {
  comum: 60,
  rara: 25,
  epica: 10,
  lendaria: 5,
};

/** Raridades possíveis na recompensa da semana completa (RN03). */
export const RARIDADES_SEMANA: Raridade[] = ["rara", "epica"];

/** Raridades possíveis na recompensa do mês completo (RN03). */
export const RARIDADES_MES: Raridade[] = ["lendaria"];

/** Função que devolve um número em [0, 1). Em produção é Math.random; nos testes, um valor fixo. */
export type Aleatorio = () => number;

export interface ItemSorteavel {
  id: string;
  rarity: Raridade;
}

/**
 * Sorteio ponderado por raridade (RN14): cada item entra com o peso da sua raridade.
 * Ex.: com uma arte comum (60) e uma lendária (5), a lendária sai 5 em cada 65 vezes.
 * Retorna null se a lista estiver vazia.
 */
export function sortearPorRaridade<T extends ItemSorteavel>(itens: T[], aleatorio: Aleatorio): T | null {
  if (itens.length === 0) return null;
  const pesoTotal = itens.reduce((soma, i) => soma + (PESO_POR_RARIDADE[i.rarity] ?? 0), 0);
  if (pesoTotal <= 0) return itens[Math.floor(aleatorio() * itens.length)];
  // "Roda" de 0 até pesoTotal: andamos pelos itens até a posição sorteada cair dentro de um deles.
  let alvo = aleatorio() * pesoTotal;
  for (const item of itens) {
    alvo -= PESO_POR_RARIDADE[item.rarity] ?? 0;
    if (alvo < 0) return item;
  }
  return itens[itens.length - 1]; // segurança contra arredondamento
}

/** Sorteio simples e uniforme (usado nas artes de recompensa de check-in, escolhidas entre as que faltam). */
export function sortearUm<T>(itens: T[], aleatorio: Aleatorio): T | null {
  if (itens.length === 0) return null;
  return itens[Math.floor(aleatorio() * itens.length)];
}

export interface ContagemCheckin {
  /** Check-ins do usuário na semana (domingo a sábado) JÁ contando o de agora. */
  diasNaSemana: number;
  /** Check-ins do usuário no mês JÁ contando o de agora. */
  diasNoMesFeitos: number;
  /** Quantos dias o mês tem. */
  diasDoMes: number;
}

/**
 * Decide as recompensas extras do check-in (RN03).
 * Como existe no máximo UM check-in por dia, a contagem só passa pelo número "7" (ou pelo total
 * do mês) uma vez. Por isso comparamos com `===`: o bônus sai uma única vez por semana/mês.
 */
export function recompensasDoCheckin(c: ContagemCheckin): { semanaCompleta: boolean; mesCompleto: boolean } {
  return {
    semanaCompleta: c.diasNaSemana === DIAS_PARA_BONUS_SEMANAL,
    mesCompleto: c.diasNoMesFeitos === c.diasDoMes,
  };
}
