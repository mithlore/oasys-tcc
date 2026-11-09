// Testes das regras do check-in e da roleta (RN03, RN04, RN14).
import { describe, expect, it } from "vitest";
import { PESO_POR_RARIDADE, recompensasDoCheckin, sortearPorRaridade, sortearUm } from "./regras";

describe("recompensasDoCheckin (RN03)", () => {
  it("só no 7º dia da semana sai o bônus", () => {
    expect(recompensasDoCheckin({ diasNaSemana: 6, diasNoMesFeitos: 6, diasDoMes: 30 }).semanaCompleta).toBe(false);
    expect(recompensasDoCheckin({ diasNaSemana: 7, diasNoMesFeitos: 7, diasDoMes: 30 }).semanaCompleta).toBe(true);
  });
  it("mês completo só quando todos os dias foram feitos", () => {
    expect(recompensasDoCheckin({ diasNaSemana: 3, diasNoMesFeitos: 29, diasDoMes: 30 }).mesCompleto).toBe(false);
    expect(recompensasDoCheckin({ diasNaSemana: 2, diasNoMesFeitos: 30, diasDoMes: 30 }).mesCompleto).toBe(true);
  });
});

describe("sortearPorRaridade (RN14)", () => {
  const itens = [
    { id: "a", rarity: "comum" as const },
    { id: "b", rarity: "lendaria" as const },
  ];
  it("lista vazia devolve null", () => {
    expect(sortearPorRaridade([], () => 0.5)).toBeNull();
  });
  it("sorteio 0 cai no primeiro item e quase 1 no último", () => {
    expect(sortearPorRaridade(itens, () => 0)!.id).toBe("a");
    expect(sortearPorRaridade(itens, () => 0.999999)!.id).toBe("b");
  });
  it("a fronteira entre comum (60) e lendária (5) fica em 60/65", () => {
    const corte = PESO_POR_RARIDADE.comum / (PESO_POR_RARIDADE.comum + PESO_POR_RARIDADE.lendaria);
    expect(sortearPorRaridade(itens, () => corte - 0.001)!.id).toBe("a");
    expect(sortearPorRaridade(itens, () => corte + 0.001)!.id).toBe("b");
  });
  it("em 100 mil sorteios a lendária sai perto de 5/65 (≈ 7,7%)", () => {
    let lendarias = 0;
    for (let i = 0; i < 100000; i++) if (sortearPorRaridade(itens, Math.random)!.id === "b") lendarias++;
    expect(lendarias / 100000).toBeGreaterThan(0.07);
    expect(lendarias / 100000).toBeLessThan(0.085);
  });
});

describe("sortearUm", () => {
  it("vazio devolve null e escolhe pelo índice sorteado", () => {
    expect(sortearUm([], () => 0.3)).toBeNull();
    expect(sortearUm(["x", "y", "z"], () => 0.5)).toBe("y");
  });
});
