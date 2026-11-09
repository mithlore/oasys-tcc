// Elos (ranks) do OASYS: 10 elos de 10 níveis cada (RF24, RN21).
// O elo vem sempre do nível; nunca é gravado pelo navegador.

export interface Elo {
  ordem: number; // 0 a 9
  nome: string;
  chave: string; // usada em classes CSS da borda do avatar
  nivelInicial: number;
  cor: string; // cor principal
  cor2: string; // cor do degradê
  /** Efeitos mais ricos nos elos altos (borda do avatar). Forma/efeito exato é livre para ajuste. */
  efeitos: "simples" | "brilho" | "lendario";
}

export const ELOS: readonly Elo[] = [
  { ordem: 0, nome: "Ferro", chave: "ferro", nivelInicial: 1, cor: "#52525b", cor2: "#8b8b94", efeitos: "simples" },
  { ordem: 1, nome: "Bronze", chave: "bronze", nivelInicial: 11, cor: "#92400e", cor2: "#d97706", efeitos: "simples" },
  { ordem: 2, nome: "Prata", chave: "prata", nivelInicial: 21, cor: "#94a3b8", cor2: "#e2e8f0", efeitos: "simples" },
  { ordem: 3, nome: "Ouro", chave: "ouro", nivelInicial: 31, cor: "#ca8a04", cor2: "#fde047", efeitos: "simples" },
  { ordem: 4, nome: "Platina", chave: "platina", nivelInicial: 41, cor: "#0d9488", cor2: "#5eead4", efeitos: "simples" },
  { ordem: 5, nome: "Rubi", chave: "rubi", nivelInicial: 51, cor: "#b91c1c", cor2: "#f87171", efeitos: "brilho" },
  { ordem: 6, nome: "Diamante", chave: "diamante", nivelInicial: 61, cor: "#0ea5e9", cor2: "#a5f3fc", efeitos: "brilho" },
  { ordem: 7, nome: "Obsidiana", chave: "obsidiana", nivelInicial: 71, cor: "#1e1033", cor2: "#a855f7", efeitos: "brilho" },
  { ordem: 8, nome: "Grão-Mestre", chave: "graomestre", nivelInicial: 81, cor: "#dc2626", cor2: "#fb923c", efeitos: "brilho" },
  { ordem: 9, nome: "Lenda Absoluta", chave: "lenda", nivelInicial: 91, cor: "#a21caf", cor2: "#fde047", efeitos: "lendario" },
];

/** Quantos níveis cada elo tem (RN21). */
export const NIVEIS_POR_ELO = 10;

/** Elo de um nível: floor((nível − 1) / 10), limitado ao último elo. */
export function obterElo(nivel: number): Elo {
  const indice = Math.min(ELOS.length - 1, Math.max(0, Math.floor((nivel - 1) / NIVEIS_POR_ELO)));
  return ELOS[indice];
}
