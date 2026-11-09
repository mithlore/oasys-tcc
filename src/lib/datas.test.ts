import { describe, expect, it } from "vitest";
import { diaDeGiro, diasNoMes, hojeEmBrasilia, inicioDaSemana, somarDias } from "./datas";

describe("datas em Brasília", () => {
  it("hoje usa o fuso de Brasília, não o UTC", () => {
    // 02:30 UTC do dia 10 ainda é 23:30 do dia 9 em Brasília.
    expect(hojeEmBrasilia(new Date("2026-11-10T02:30:00Z"))).toBe("2026-11-09");
    expect(hojeEmBrasilia(new Date("2026-11-10T03:00:00Z"))).toBe("2026-11-10");
  });
  it("a semana começa no domingo", () => {
    expect(inicioDaSemana("2026-11-08")).toBe("2026-11-08"); // domingo
    expect(inicioDaSemana("2026-11-09")).toBe("2026-11-08"); // segunda
    expect(inicioDaSemana("2026-11-14")).toBe("2026-11-08"); // sábado
    expect(inicioDaSemana("2026-11-15")).toBe("2026-11-15"); // próximo domingo
  });
  it("soma dias atravessando mês e ano", () => {
    expect(somarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(somarDias("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("dias no mês", () => {
    expect(diasNoMes("2026-02")).toBe(28);
    expect(diasNoMes("2028-02")).toBe(29);
    expect(diasNoMes("2026-11")).toBe(30);
  });
  it("o dia de giro muda às 21h de Brasília (RN04)", () => {
    // 20:59 em Brasília (23:59 UTC): ainda é o período que começou ontem.
    expect(diaDeGiro(new Date("2026-11-09T23:59:00Z"))).toBe("2026-11-08");
    // 21:00 em Brasília (00:00 UTC do dia seguinte): novo período.
    expect(diaDeGiro(new Date("2026-11-10T00:00:00Z"))).toBe("2026-11-09");
  });
});
