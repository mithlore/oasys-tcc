// Estrutura comum das telas (para quem está logado): barra superior com a navegação do protótipo
// e, à direita, o nível/elo do jogador e o botão de sair (RF01, RF15, RF24).
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePerfil } from "@/hooks/usePerfil";
import { obterElo } from "@/lib/elos";
import { IconeElo, IconeSair } from "@/components/icons/Icones";
import LogoOasys from "@/components/LogoOasys";
import WordmarkOasys from "@/components/WordmarkOasys";

const LINKS = [
  { para: "/", rotulo: "Início" },
  { para: "/catalogo", rotulo: "Catálogo" },
  { para: "/santuario", rotulo: "Santuário" },
  { para: "/colecao", rotulo: "Coleção" },
  { para: "/amigos", rotulo: "Amigos" },
  { para: "/feed", rotulo: "Feed" },
  { para: "/arquetipos", rotulo: "Arquétipos" },
];

export default function Layout() {
  const { usuario, sair } = useAuth();
  const { data: perfil } = usePerfil();
  // O elo vem do nível (RN21): calculado aqui só para exibir, nunca gravado.
  const elo = perfil ? obterElo(perfil.level) : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-linha">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
          {/* Logo + nome no canto esquerdo do cabeçalho */}
          <span className="flex items-center gap-3">
            <LogoOasys tamanho={30} />
            <WordmarkOasys altura={22} />
          </span>
          <ul className="flex flex-wrap gap-1">
            {LINKS.map((l) => (
              <li key={l.para}>
                <NavLink
                  to={l.para}
                  end={l.para === "/"}
                  className={({ isActive }) =>
                    cn("rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white", isActive && "bg-violeta/15 text-violeta")
                  }
                >
                  {l.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Quem está logado: elo + nível + nome + sair */}
          <div className="ml-auto flex items-center gap-3 text-sm">
            {perfil && elo && (
              <span className="flex items-center gap-2" title={`Elo ${elo.nome}`}>
                <IconeElo cor={elo.cor} cor2={elo.cor2} className="h-6 w-6" />
                <span className="text-white/80">
                  <span className="hidden sm:inline">{perfil.username} · </span>
                  Nível {perfil.level}
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={() => void sair()}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-white/60 hover:bg-white/5 hover:text-white"
              aria-label={`Sair da conta ${usuario?.email ?? ""}`}
            >
              <IconeSair className="h-5 w-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
