import { describe, expect, it } from "vitest";
import { calcularNivel, progressoDeXp, xpDoNivel } from "./xp";

describe("xp e nível (RN20)", () => {
  it("nível N começa em 5·N·(N−1)", () => {
    expect(xpDoNivel(1)).toBe(0);
    expect(xpDoNivel(2)).toBe(10);
    expect(xpDoNivel(84)).toBe(34860);
    expect(xpDoNivel(85)).toBe(35700);
    expect(xpDoNivel(100)).toBe(49500);
  });
  it("calcula o nível pelo XP", () => {
    expect(calcularNivel(0)).toBe(1);
    expect(calcularNivel(9)).toBe(1);
    expect(calcularNivel(10)).toBe(2);
    expect(calcularNivel(35001)).toBe(84); // caso real do perfil de exemplo
    expect(calcularNivel(49500)).toBe(100);
    expect(calcularNivel(999999)).toBe(100); // limite máximo
    expect(calcularNivel(-5)).toBe(1);
  });
  it("calcula o progresso e quanto falta", () => {
    const p = progressoDeXp(35001);
    expect(p.nivel).toBe(84);
    expect(p.faltam).toBe(699);
    expect(p.xpProximoNivel).toBe(35700);
    expect(progressoDeXp(60000).xpProximoNivel).toBeNull();
  });
});
