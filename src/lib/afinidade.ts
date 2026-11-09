// Cálculo de afinidade usuário × jogo (RF07, RN06, RN07, RN08, RN15, RN16, RN17, RNF06).
// Segue a seção 4.4 do TCC. São FUNÇÕES PURAS: não acessam banco nem rede, então
// podem ser testadas e explicadas passo a passo na defesa.
// Não usa IA nem aprendizado de máquina (RN08). Só usa o histórico do PRÓPRIO usuário (RN06).

// ---------- Constantes (pesos iniciais, documentados no TCC) ----------

/** α: peso da avaliação. O peso real é α · (nota − média das notas do usuário). */
export const PESO_AVALIACAO = 1;
/** β: peso de um jogo favoritado. */
export const PESO_FAVORITO = 2;
/** γ: peso de uma visualização de página do jogo. */
export const PESO_VISUALIZACAO = 0.5;

/** Atributos que entram no cálculo: A = {estilo, ritmo, dificuldade, tipo de mundo}. */
export const ATRIBUTOS = ["play_style", "pace", "difficulty", "world_type"] as const;
export type Atributo = (typeof ATRIBUTOS)[number];

/** Tamanho da lista que recebe a diversificação (RN16). */
export const TAMANHO_TOPO = 10;
/** No máximo 3 jogos do mesmo estilo entre os 10 primeiros (RN16). */
export const MAXIMO_MESMO_ESTILO = 3;

// ---------- Tipos ----------

export interface Jogo {
  id: string;
  titulo: string;
  play_style: string;
  pace: string;
  difficulty: string;
  world_type: string;
}

export type Interacao =
  | { tipo: "avaliacao"; jogoId: string; nota: number }
  | { tipo: "favorito"; jogoId: string }
  | { tipo: "visualizacao"; jogoId: string };

/** Para cada atributo, um mapa "valor do atributo" → score. */
export type ScoresPorAtributo = Record<Atributo, Map<string, number>>;

/** Quanto um atributo contribuiu para a pontuação de um jogo (explicabilidade, RNF06). */
export interface Contribuicao {
  atributo: Atributo;
  valor: string;
  contribuicao: number;
}

export interface Recomendacao {
  jogo: Jogo;
  pontuacao: number;
  /** Atributos que mais pesaram, do maior para o menor: base do "Recomendado porque…". */
  contribuicoes: Contribuicao[];
}

// ---------- Passos do cálculo ----------

/** Há histórico se o usuário tem ao menos uma interação (RN07). */
export function temHistorico(interacoes: Interacao[]): boolean {
  return interacoes.length > 0;
}

/** μ: média das notas dadas pelo próprio usuário. Sem avaliações, retorna 0. */
export function mediaDasNotas(interacoes: Interacao[]): number {
  const notas = interacoes.flatMap((i) => (i.tipo === "avaliacao" ? [i.nota] : []));
  if (notas.length === 0) return 0;
  return notas.reduce((soma, n) => soma + n, 0) / notas.length;
}

/**
 * w(i): peso de uma interação (equação 4 do TCC).
 * Nota abaixo da média vira peso NEGATIVO, e acima vira positivo (RN15).
 */
export function pesoDaInteracao(interacao: Interacao, media: number): number {
  switch (interacao.tipo) {
    case "avaliacao":
      return PESO_AVALIACAO * (interacao.nota - media);
    case "favorito":
      return PESO_FAVORITO;
    case "visualizacao":
      return PESO_VISUALIZACAO;
  }
}

/** Score bruto s(a, x): soma dos pesos das interações com jogos em que o atributo a vale x. */
export function calcularScoresBrutos(
  interacoes: Interacao[],
  jogosPorId: Map<string, Jogo>,
): ScoresPorAtributo {
  const scores = Object.fromEntries(ATRIBUTOS.map((a) => [a, new Map<string, number>()])) as ScoresPorAtributo;
  const media = mediaDasNotas(interacoes);
  for (const interacao of interacoes) {
    const jogo = jogosPorId.get(interacao.jogoId);
    if (!jogo) continue; // interação com jogo que não existe mais: ignora
    const peso = pesoDaInteracao(interacao, media);
    for (const atributo of ATRIBUTOS) {
      const valor = jogo[atributo];
      scores[atributo].set(valor, (scores[atributo].get(valor) ?? 0) + peso);
    }
  }
  return scores;
}

/**
 * Normalização (equação 3): ŝ(x) = s(x) / Σ|s(x')| sobre os valores do mesmo atributo.
 * Se o denominador for 0, o score normalizado é 0.
 */
export function normalizarScores(brutos: ScoresPorAtributo): ScoresPorAtributo {
  const resultado = Object.fromEntries(ATRIBUTOS.map((a) => [a, new Map<string, number>()])) as ScoresPorAtributo;
  for (const atributo of ATRIBUTOS) {
    let denominador = 0;
    for (const s of brutos[atributo].values()) denominador += Math.abs(s);
    for (const [valor, s] of brutos[atributo]) {
      resultado[atributo].set(valor, denominador === 0 ? 0 : s / denominador);
    }
  }
  return resultado;
}

/**
 * Afinidade do jogo (equação 2): soma, nos 4 atributos, do score normalizado do valor que o jogo tem.
 * Também devolve a contribuição de cada atributo, do maior para o menor (RNF06).
 */
export function calcularAfinidade(
  jogo: Jogo,
  normalizados: ScoresPorAtributo,
): { pontuacao: number; contribuicoes: Contribuicao[] } {
  const contribuicoes: Contribuicao[] = ATRIBUTOS.map((atributo) => ({
    atributo,
    valor: jogo[atributo],
    contribuicao: normalizados[atributo].get(jogo[atributo]) ?? 0,
  }));
  const pontuacao = contribuicoes.reduce((soma, c) => soma + c.contribuicao, 0);
  contribuicoes.sort((a, b) => b.contribuicao - a.contribuicao);
  return { pontuacao, contribuicoes };
}

/** Ordena do maior para o menor; em empate, por título em ordem alfabética (RN17). */
export function ordenarPorAfinidade(lista: Recomendacao[]): Recomendacao[] {
  return [...lista].sort(
    (a, b) => b.pontuacao - a.pontuacao || a.jogo.titulo.localeCompare(b.jogo.titulo, "pt-BR"),
  );
}

/**
 * Diversificação (RN16): entre os `tamanho` primeiros, no máximo `maximo` com o mesmo play_style.
 * Quem passa do limite é adiado para depois do topo, mantendo a ordem original.
 * Se não houver jogos suficientes de outros estilos, o topo é completado com os adiados.
 */
export function diversificar(
  ordenados: Recomendacao[],
  tamanho: number = TAMANHO_TOPO,
  maximo: number = MAXIMO_MESMO_ESTILO,
): Recomendacao[] {
  const topo: Recomendacao[] = [];
  const adiados: Recomendacao[] = [];
  const contagem = new Map<string, number>();
  for (const item of ordenados) {
    const estilo = item.jogo.play_style;
    if (topo.length < tamanho && (contagem.get(estilo) ?? 0) < maximo) {
      topo.push(item);
      contagem.set(estilo, (contagem.get(estilo) ?? 0) + 1);
    } else {
      adiados.push(item);
    }
  }
  // Se faltou gente de outros estilos, completa o topo com os adiados (melhores primeiro).
  while (topo.length < tamanho && adiados.length > 0) topo.push(adiados.shift()!);
  return [...topo, ...adiados];
}

export interface OpcoesDeRecomendacao {
  /** Jogos que não devem aparecer (ex.: os que o usuário já favoritou). Padrão: nenhum. */
  excluirIds?: Set<string>;
}

/**
 * Recomendação completa: pesos → scores → normalização → afinidade → ordenação → diversificação.
 * Sem histórico, devolve lista vazia (RN07): a interface mostra as seções gerais, sem pontuação.
 */
export function recomendar(
  jogos: Jogo[],
  interacoes: Interacao[],
  opcoes: OpcoesDeRecomendacao = {},
): Recomendacao[] {
  if (!temHistorico(interacoes)) return [];
  const jogosPorId = new Map(jogos.map((j) => [j.id, j]));
  const normalizados = normalizarScores(calcularScoresBrutos(interacoes, jogosPorId));
  const candidatos: Recomendacao[] = jogos
    .filter((j) => !opcoes.excluirIds?.has(j.id))
    .map((jogo) => ({ jogo, ...calcularAfinidade(jogo, normalizados) }));
  return diversificar(ordenarPorAfinidade(candidatos));
}

// ---------- Linha de base para a avaliação do TCC ----------

/** Gerador pseudoaleatório com semente (mulberry32): mesma semente, mesma sequência. */
export function criarAleatorio(semente: number): () => number {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lista aleatória do mesmo tamanho da recomendada. É a linha de base: o teste de relevância
 * compara a lista do OASYS com esta, sem o participante saber qual é qual.
 */
export function listaAleatoria(
  jogos: Jogo[],
  tamanho: number,
  aleatorio: () => number = Math.random,
): Jogo[] {
  const copia = [...jogos];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, tamanho);
}
