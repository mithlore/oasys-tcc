import { describe, expect, it } from "vitest";
import { calcularNivel, progressoDeXp, xpDoNivel } from "./xp";

describe("xp e nível (RN20)", () => {
  it("nível N começa em N·(N−1)", () => {
    expect(xpDoNivel(1)).toBe(0);
    expect(xpDoNivel(2)).toBe(2);
    expect(xpDoNivel(89)).toBe(7832);
    expect(xpDoNivel(90)).toBe(8010);
    expect(xpDoNivel(100)).toBe(9900);
  });
  it("calcula o nível pelo XP", () => {
    expect(calcularNivel(0)).toBe(1);
    expect(calcularNivel(1)).toBe(1);
    expect(calcularNivel(2)).toBe(2);
    expect(calcularNivel(7831)).toBe(88);
    expect(calcularNivel(7832)).toBe(89);
    expect(calcularNivel(9899)).toBe(99);
    expect(calcularNivel(9900)).toBe(100);
    expect(calcularNivel(999999)).toBe(100); // limite máximo
    expect(calcularNivel(-5)).toBe(1);
  });
  it("calcula o progresso e quanto falta", () => {
    const p = progressoDeXp(8000);
    expect(p.nivel).toBe(89);
    expect(p.faltam).toBe(10);
    expect(p.xpProximoNivel).toBe(8010);
    expect(progressoDeXp(20000).xpProximoNivel).toBeNull();
  });
  it("só check-in todo dia chega ao nível 100 em cerca de 11 meses (RN03)", () => {
    // Cada semana completa rende 7 · 15 + 100 = 205 XP. 9.900 / 205 ≈ 48,3 semanas.
    const xpPorSemana = 7 * 15 + 100;
    const semanasAteTeto = Math.ceil(xpDoNivel(100) / xpPorSemana);
    expect(semanasAteTeto).toBe(49);
    expect(semanasAteTeto).toBeLessThanOrEqual(52); // antes de completar 1 ano
  });
});
