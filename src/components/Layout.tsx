// Estrutura comum das telas: barra superior com a navegação do protótipo (RF01).
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  return (
    <div className="min-h-screen">
      <header className="border-b border-linha">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
          <span className="font-titulo text-xl font-bold tracking-[0.3em]">OASYS</span>
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
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
