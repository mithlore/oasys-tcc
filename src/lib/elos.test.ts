import { describe, expect, it } from "vitest";
import { ELOS, obterElo } from "./elos";

describe("elos (RN21)", () => {
  it("são 10 elos de 10 níveis", () => {
    expect(ELOS).toHaveLength(10);
    ELOS.forEach((e, i) => expect(e.nivelInicial).toBe(i * 10 + 1));
  });
  it("mapeia nível para elo", () => {
    expect(obterElo(1).nome).toBe("Ferro");
    expect(obterElo(10).nome).toBe("Ferro");
    expect(obterElo(11).nome).toBe("Bronze");
    expect(obterElo(84).nome).toBe("Grão-Mestre");
    expect(obterElo(91).nome).toBe("Lenda Absoluta");
    expect(obterElo(100).nome).toBe("Lenda Absoluta");
  });
  it("limita níveis fora da faixa", () => {
    expect(obterElo(0).nome).toBe("Ferro");
    expect(obterElo(500).nome).toBe("Lenda Absoluta");
  });
});
