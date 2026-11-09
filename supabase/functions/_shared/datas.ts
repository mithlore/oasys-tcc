// Datas no fuso de Brasília (America/Sao_Paulo). O servidor pode estar em UTC,
// por isso "hoje" nunca é calculado com getDate() direto (RN03, RN04, RNF05).
// Todas as funções são puras: recebem a data como parâmetro, o que facilita testar.

const FUSO = "America/Sao_Paulo";

/** Hora (0 a 23) em que os giros da roleta reiniciam, horário de Brasília (RN04). */
export const HORA_REINICIO_GIROS = 21;

interface Partes {
  ano: number;
  mes: number;
  dia: number;
  hora: number;
}

function partesEmBrasilia(data: Date): Partes {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const mapa: Record<string, number> = {};
  for (const p of f.formatToParts(data)) if (p.type !== "literal") mapa[p.type] = Number(p.value);
  return { ano: mapa.year, mes: mapa.month, dia: mapa.day, hora: mapa.hour };
}

const dois = (n: number) => String(n).padStart(2, "0");
const formatar = (ano: number, mes: number, dia: number) => `${ano}-${dois(mes)}-${dois(dia)}`;

/** Soma dias a uma data "YYYY-MM-DD" (calendário puro, sem fuso). */
export function somarDias(dataIso: string, dias: number): string {
  const [a, m, d] = dataIso.split("-").map(Number);
  const t = new Date(Date.UTC(a, m - 1, d + dias));
  return formatar(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

/** Dia do check-in: a data de hoje em Brasília, "YYYY-MM-DD" (RN03). */
export function hojeEmBrasilia(agora: Date = new Date()): string {
  const p = partesEmBrasilia(agora);
  return formatar(p.ano, p.mes, p.dia);
}

/** Dia da semana de uma data "YYYY-MM-DD": 0 = domingo ... 6 = sábado. */
export function diaDaSemana(dataIso: string): number {
  const [a, m, d] = dataIso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

/**
 * Primeiro dia (domingo) da semana que contém a data. A semana do OASYS vai de
 * domingo a sábado (RN03). Não usa a semana ISO, que começa na segunda.
 */
export function inicioDaSemana(dataIso: string): string {
  return somarDias(dataIso, -diaDaSemana(dataIso));
}

/** Mês de uma data "YYYY-MM-DD", no formato "YYYY-MM". */
export function mesDaData(dataIso: string): string {
  return dataIso.slice(0, 7);
}

/** Quantos dias o mês tem (usado na recompensa de mês completo). */
export function diasNoMes(mes: string): number {
  const [a, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(a, m, 0)).getUTCDate();
}

/**
 * "Dia de giro" da roleta: começa às 21h de Brasília e termina às 21h seguintes (RN04).
 * Retorna a data em que o período atual COMEÇOU. Antes das 21h, é a data de ontem.
 */
export function diaDeGiro(agora: Date = new Date()): string {
  const p = partesEmBrasilia(agora);
  const hoje = formatar(p.ano, p.mes, p.dia);
  return p.hora >= HORA_REINICIO_GIROS ? hoje : somarDias(hoje, -1);
}
