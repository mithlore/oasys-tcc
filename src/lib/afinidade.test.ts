import { describe, expect, it } from "vitest";
import {
  calcularScoresBrutos,
  criarAleatorio,
  diversificar,
  listaAleatoria,
  mediaDasNotas,
  normalizarScores,
  recomendar,
  temHistorico,
  type Interacao,
  type Jogo,
  type Recomendacao,
} from "./afinidade";

const jogo = (id: string, titulo: string, play_style: string, extra: Partial<Jogo> = {}): Jogo => ({
  id, titulo, play_style, pace: "lento", difficulty: "medio", world_type: "aberto", ...extra,
});

describe("afinidade", () => {
  it("sem histórico não recomenda (RN07)", () => {
    expect(temHistorico([])).toBe(false);
    expect(recomendar([jogo("1", "A", "acao")], [])).toEqual([]);
  });

  it("nota abaixo da média vira peso negativo e acima, positivo (RN15)", () => {
    const jogos = new Map([
      ["1", jogo("1", "Bom", "acao")],
      ["2", jogo("2", "Ruim", "puzzle")],
    ]);
    const interacoes: Interacao[] = [
      { tipo: "avaliacao", jogoId: "1", nota: 5 },
      { tipo: "avaliacao", jogoId: "2", nota: 1 },
    ];
    expect(mediaDasNotas(interacoes)).toBe(3);
    const brutos = calcularScoresBrutos(interacoes, jogos);
    expect(brutos.play_style.get("acao")).toBe(2); // 1 · (5 − 3)
    expect(brutos.play_style.get("puzzle")).toBe(-2); // 1 · (1 − 3)
  });

  it("normaliza dividindo pela soma dos módulos; denominador 0 dá 0", () => {
    const jogos = new Map([["1", jogo("1", "A", "acao")]]);
    const n = normalizarScores(calcularScoresBrutos([{ tipo: "favorito", jogoId: "1" }], jogos));
    expect(n.play_style.get("acao")).toBe(1);
    // uma única nota: média = nota, peso 0, denominador 0
    const zero = normalizarScores(
      calcularScoresBrutos([{ tipo: "avaliacao", jogoId: "1", nota: 4 }], jogos),
    );
    expect(zero.play_style.get("acao")).toBe(0);
  });

  it("recomenda primeiro o jogo parecido com o que o usuário favoritou", () => {
    const jogos = [
      jogo("1", "Favorito", "acao"),
      jogo("2", "Parecido", "acao"),
      jogo("3", "Diferente", "puzzle", { pace: "rapido", difficulty: "facil", world_type: "linear" }),
    ];
    const r = recomendar(jogos, [{ tipo: "favorito", jogoId: "1" }]);
    expect(r[0].jogo.id).toBe("1");
    expect(r[1].jogo.id).toBe("2");
    expect(r[2].jogo.id).toBe("3");
    expect(r[2].pontuacao).toBe(0);
    expect(r[0].contribuicoes).toHaveLength(4); // explicabilidade (RNF06)
  });

  it("exclui jogos pedidos", () => {
    const jogos = [jogo("1", "A", "acao"), jogo("2", "B", "acao")];
    const r = recomendar(jogos, [{ tipo: "favorito", jogoId: "1" }], { excluirIds: new Set(["1"]) });
    expect(r.map((x) => x.jogo.id)).toEqual(["2"]);
  });

  it("empate de pontuação desempata pelo título (RN17)", () => {
    const jogos = [jogo("1", "Zebra", "acao"), jogo("2", "Abacaxi", "acao"), jogo("3", "Ouro", "puzzle")];
    const r = recomendar(jogos, [{ tipo: "visualizacao", jogoId: "3" }]);
    const mesmaPontuacao = r.filter((x) => x.pontuacao === r[r.length - 1].pontuacao);
    expect(mesmaPontuacao.map((x) => x.jogo.titulo)).toEqual(["Abacaxi", "Zebra"]);
  });

  it("diversifica: no máximo 3 do mesmo estilo entre os 10 primeiros (RN16)", () => {
    // 4 estilos × 8 jogos. Os de "acao" têm as maiores pontuações, mas só 3 podem entrar no topo.
    const estilos = ["acao", "puzzle", "rpg", "estrategia"];
    const itens: Recomendacao[] = [];
    estilos.forEach((estilo, e) => {
      for (let i = 0; i < 8; i++) {
        itens.push({ jogo: jogo(`${estilo}${i}`, `${estilo}${i}`, estilo), pontuacao: 100 - e * 10 - i, contribuicoes: [] });
      }
    });
    const ordenados = [...itens].sort((x, y) => y.pontuacao - x.pontuacao);
    const topo = diversificar(ordenados).slice(0, 10);
    expect(topo).toHaveLength(10);
    for (const estilo of estilos) {
      expect(topo.filter((x) => x.jogo.play_style === estilo).length).toBeLessThanOrEqual(3);
    }
  });

  it("completa o topo com os adiados quando não há outros estilos", () => {
    const itens: Recomendacao[] = [];
    for (let i = 0; i < 6; i++) itens.push({ jogo: jogo(`a${i}`, `A${i}`, "acao"), pontuacao: 6 - i, contribuicoes: [] });
    expect(diversificar(itens).map((x) => x.jogo.id)).toEqual(["a0", "a1", "a2", "a3", "a4", "a5"]);
  });

  it("lista aleatória tem o tamanho pedido e é reproduzível com semente", () => {
    const jogos = Array.from({ length: 30 }, (_, i) => jogo(`${i}`, `J${i}`, "acao"));
    const a = listaAleatoria(jogos, 10, criarAleatorio(42)).map((j) => j.id);
    const b = listaAleatoria(jogos, 10, criarAleatorio(42)).map((j) => j.id);
    expect(a).toHaveLength(10);
    expect(a).toEqual(b);
  });
});
