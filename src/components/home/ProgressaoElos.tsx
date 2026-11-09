// Seção "Progressão" da home (RF24, RN20, RN21): a escada dos 10 elos, destacando o do usuário.
// O elo e o nível vêm do banco; aqui só mostramos. Convertida de design/oasys-home-prototipo.html.
import { usePerfil } from "@/hooks/usePerfil";
import { ELOS, NIVEIS_POR_ELO, obterElo } from "@/lib/elos";
import { progressoDeXp } from "@/lib/xp";
import { IconeAlerta, IconeElo } from "@/components/icons/Icones";
import { cn } from "@/lib/utils";

export default function ProgressaoElos() {
  const perfil = usePerfil();
  const nivel = perfil.data?.level;
  const eloAtual = nivel ? obterElo(nivel) : null;
  const prog = perfil.data ? progressoDeXp(perfil.data.xp) : null;

  return (
    <section aria-labelledby="titulo-elos" className="grid gap-6">
      <div>
        <span className="font-titulo text-xs font-semibold uppercase tracking-[0.2em] text-violeta">Progressão</span>
        <h2 id="titulo-elos" className="mt-2 font-titulo text-3xl font-bold tracking-tight sm:text-4xl">
          Do Ferro à <span className="text-violeta">Lenda Absoluta.</span>
        </h2>
        {/* Texto de apoio com estados de carregamento e de erro */}
        {perfil.isLoading && <div className="mt-3 h-5 w-72 animate-pulse rounded bg-white/10" aria-busy="true" />}
        {perfil.isError && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-red-300" role="alert">
            <IconeAlerta className="h-4 w-4" /> Não foi possível carregar seu elo.
          </p>
        )}
        {eloAtual && prog && (
          <p className="mt-2 text-white/60">
            Você está no {eloAtual.nome}.{" "}
            {prog.xpProximoNivel ? `Faltam ${prog.faltam} XP para o nível ${prog.nivel + 1}.` : "Você chegou ao nível máximo."}
          </p>
        )}
      </div>

      {/* Escada: rola para o lado no celular em vez de cortar (RNF04) */}
      <div className="overflow-x-auto pb-2">
        <ol className="relative grid min-w-[880px] grid-cols-10 pt-10">
          {/* Linha de fundo que liga os elos */}
          <span className="absolute left-12 right-12 top-[58px] h-0.5 bg-gradient-to-r from-zinc-600 via-yellow-600 to-red-600 opacity-50" aria-hidden="true" />
          {ELOS.map((elo) => {
            const voce = eloAtual?.chave === elo.chave;
            return (
              <li key={elo.chave} className="relative grid justify-items-center gap-2 text-center text-xs text-white/55">
                {voce && (
                  <span className="absolute -top-7 rounded bg-ouro px-1.5 py-0.5 font-titulo text-[10px] font-bold tracking-wider text-fundo">VOCÊ</span>
                )}
                <IconeElo
                  cor={elo.cor}
                  cor2={elo.cor2}
                  className={cn("h-9 w-9 transition-transform", voce && "scale-125 drop-shadow-[0_0_12px_rgba(253,224,71,0.5)]")}
                />
                <b className={cn("font-titulo text-[13px]", voce ? "text-white" : "text-white/85")}>{elo.nome}</b>
                <span>Nível {elo.nivelInicial}–{elo.nivelInicial + NIVEIS_POR_ELO - 1}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
