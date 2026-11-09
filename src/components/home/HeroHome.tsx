// Topo da home (RF15, RF16, RN03, RN20, RN21): título, nível/XP, semana de check-ins e botões.
// Convertido da seção "hero" de design/oasys-home-prototipo.html.
// Os números vêm do banco: nada de XP, nível ou elo calculado "por conta própria" no navegador (RNF02).
import { Link } from "react-router-dom";
import { usePerfil } from "@/hooks/usePerfil";
import { useFazerCheckin, useSemanaDeCheckins } from "@/hooks/useCheckin";
import { obterElo } from "@/lib/elos";
import { progressoDeXp, XP_CHECKIN, XP_BONUS_SEMANA } from "@/lib/xp";
import { hojeEmBrasilia, inicioDaSemana, somarDias } from "@/lib/datas";
import { cn } from "@/lib/utils";
import { IconeAlerta, IconeBrilho, IconeCarregando, IconeConfirmar, IconeElo } from "@/components/icons/Icones";

// Letras dos 7 dias, de domingo a sábado (a semana do OASYS começa no domingo, RN03)
const LETRAS_DA_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function HeroHome() {
  const perfil = usePerfil();
  const semana = useSemanaDeCheckins();
  const checkin = useFazerCheckin();

  const hoje = hojeEmBrasilia();
  const domingo = inicioDaSemana(hoje);
  // Os 7 dias da semana atual, como datas AAAA-MM-DD
  const dias = LETRAS_DA_SEMANA.map((letra, i) => ({ letra, data: somarDias(domingo, i) }));
  const feitos = new Set(semana.data ?? []);
  const jaFezHoje = feitos.has(hoje);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-linha" aria-labelledby="titulo-hero">
      {/* Brilhos de fundo do protótipo (violeta à esquerda, azul à direita) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-violeta-escuro/30 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-azul/15 blur-3xl" />
      </div>

      <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="grid min-w-0 gap-6 animate-entrar">
          <span className="flex items-center gap-3 font-titulo text-xs font-semibold uppercase tracking-[0.18em] text-violeta">
            <i className="h-px w-6 bg-current" /> Bem-vindo de volta
          </span>

          <h1 id="titulo-hero" className="font-titulo text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Descubra seu <span className="text-violeta">próximo</span> jogo.
          </h1>

          <p className="max-w-md text-tinta/65">
            Recomendações feitas para o seu jeito de jogar, uma comunidade que joga junto e artes para colecionar.
          </p>

          {/* Quadro de progresso: elo, nível, barra de XP e a semana de check-ins */}
          <CartaoDeProgresso
            carregando={perfil.isLoading}
            erro={perfil.isError}
            xp={perfil.data?.xp}
            nivel={perfil.data?.level}
          />

          {/* Semana de domingo a sábado: marca os dias feitos e o de hoje */}
          <div className="grid gap-3">
            <ol className="flex flex-wrap items-center gap-1.5" aria-label="Check-ins desta semana">
              {dias.map((d) => (
                <li
                  key={d.data}
                  aria-label={`${d.data}${feitos.has(d.data) ? ", check-in feito" : ""}`}
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-md border border-linha font-titulo text-[11px] font-bold text-tinta/45",
                    feitos.has(d.data) && "border-violeta/50 bg-violeta/20 text-violeta",
                    d.data === hoje && !feitos.has(d.data) && "border-transparent bg-violeta text-fundo",
                  )}
                >
                  {d.letra}
                </li>
              ))}
              <li className="ml-2 text-xs text-tinta/50">
                Semana completa = +{XP_BONUS_SEMANA} XP
              </li>
            </ol>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => checkin.mutate()}
                disabled={checkin.isPending || jaFezHoje || semana.isLoading}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-violeta to-violeta-escuro px-6 py-3 font-titulo text-sm font-semibold text-white shadow-lg shadow-violeta-escuro/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {checkin.isPending ? <IconeCarregando className="h-4 w-4 animate-spin" /> : jaFezHoje ? <IconeConfirmar className="h-4 w-4" /> : <IconeBrilho className="h-4 w-4" />}
                {jaFezHoje ? "Check-in de hoje feito" : `Fazer check-in (+${XP_CHECKIN} XP)`}
              </button>

              {/* Mensagem do resultado, lida por leitores de tela (aria-live) */}
              <p role="status" aria-live="polite" className="text-sm">
                {checkin.isError && (
                  <span className="flex items-center gap-1.5 text-red-300">
                    <IconeAlerta className="h-4 w-4" /> Não foi possível fazer o check-in agora. Tente de novo.
                  </span>
                )}
                {checkin.isSuccess && !checkin.data.ja_fez_checkin && (
                  <span className="text-emerald-300">
                    +{checkin.data.xp_ganho} XP{checkin.data.semana_completa ? " e bônus da semana completa!" : ""}
                  </span>
                )}
                {checkin.isSuccess && checkin.data.ja_fez_checkin && (
                  <span className="text-tinta/60">Você já fez o check-in de hoje.</span>
                )}
                {semana.isError && <span className="text-red-300">Não foi possível carregar a semana.</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/arquetipos" className="inline-flex items-center gap-2 rounded-full border border-linha bg-tinta/5 px-6 py-3 font-titulo text-sm font-semibold hover:bg-tinta/10">
              <IconeBrilho className="h-4 w-4 text-violeta" /> Me Descobrir
            </Link>
            <Link to="/catalogo" className="inline-flex items-center rounded-full border border-linha bg-tinta/5 px-6 py-3 font-titulo text-sm font-semibold hover:bg-tinta/10">
              Explorar o catálogo
            </Link>
          </div>
        </div>

        <PalcoDecorativo nivel={perfil.data?.level} />
      </div>
    </section>
  );
}

/** Cartão com o elo, o nível e a barra de XP. Mostra estados de carregamento e de erro (RNF04). */
function CartaoDeProgresso({ carregando, erro, xp, nivel }: { carregando: boolean; erro: boolean; xp?: number; nivel?: number }) {
  if (carregando) {
    // Esqueleto: um bloco cinza no lugar do cartão enquanto os dados chegam
    return <div className="h-24 animate-pulse rounded-2xl border border-linha bg-tinta/5" aria-busy="true" aria-label="Carregando seu progresso" />;
  }
  if (erro || xp === undefined || nivel === undefined) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
        <IconeAlerta className="h-5 w-5" /> Não foi possível carregar seu progresso.
      </div>
    );
  }
  const elo = obterElo(nivel); // o elo vem do nível (RN21)
  const prog = progressoDeXp(xp); // dados da barra: calculados a partir do XP que veio do banco
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-linha bg-painel/70 p-4">
      <div className="relative grid h-16 w-16 flex-none place-items-center">
        <IconeElo cor={elo.cor} cor2={elo.cor2} className="h-16 w-16" />
        <b className="absolute font-titulo text-lg text-white drop-shadow">{nivel}</b>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap justify-between gap-x-4 text-sm">
          <span><b className="font-titulo">Elo {elo.nome}</b> · Nível {nivel}</span>
          <span className="text-tinta/60">
            {prog.xpProximoNivel ? `${xp} / ${prog.xpProximoNivel} XP` : `${xp} XP (nível máximo)`}
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-tinta/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(prog.percentual)}
          aria-label="Progresso para o próximo nível"
        >
          <i className="block h-full rounded-full bg-gradient-to-r from-yellow-600 to-ouro" style={{ width: `${prog.percentual}%` }} />
        </div>
        {prog.xpProximoNivel && <p className="mt-1.5 text-xs text-tinta/50">Faltam {prog.faltam} XP para o nível {nivel + 1}.</p>}
      </div>
    </div>
  );
}

/** Lado direito do hero: anéis e cartões flutuantes só de enfeite (some no celular). */
function PalcoDecorativo({ nivel }: { nivel?: number }) {
  const elo = obterElo(nivel ?? 1);
  return (
    <div className="relative hidden h-[420px] lg:block" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="anel-hero" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#anel-hero)">
          <circle cx="200" cy="200" r="110" strokeOpacity="0.35" />
          <circle cx="200" cy="200" r="150" strokeOpacity="0.22" strokeDasharray="2 10" />
          <circle cx="200" cy="200" r="190" strokeOpacity="0.1" />
        </g>
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <IconeElo cor={elo.cor} cor2={elo.cor2} className="h-28 w-28 drop-shadow-[0_0_30px_rgba(167,139,250,0.5)]" />
      </div>
      <div className="absolute bottom-[10%] left-[6%] flex items-center gap-3 rounded-2xl border border-linha bg-painel/90 p-3.5 text-[13px] shadow-2xl">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violeta/15 font-titulo text-[15px] font-extrabold text-violeta">+{XP_CHECKIN}</div>
        <div>
          <b className="block font-titulo text-sm">Check-in diário</b>
          <span className="text-tinta/55">Semana completa = +{XP_BONUS_SEMANA} XP</span>
        </div>
      </div>
      <div className="absolute right-[4%] top-[14%] flex items-center gap-3 rounded-2xl border border-linha bg-painel/90 p-3.5 text-[13px] shadow-2xl">
        <IconeElo cor={elo.cor} cor2={elo.cor2} className="h-9 w-9" />
        <div>
          <b className="block font-titulo text-sm">Elo {elo.nome}</b>
          <span className="text-tinta/55">Suba de nível e mude a borda</span>
        </div>
      </div>
    </div>
  );
}
