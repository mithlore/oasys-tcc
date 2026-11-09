// Arte da tela de login (RF01): "Portal do OASYS".
// A logo oficial fica no centro, com um brilho violeta atrás.
// O fundo é um céu com constelações de verdade (Cruzeiro do Sul, Órion e Cassiopeia),
// desenhadas à mão: estrelas de brilhos diferentes, ligadas por linhas finas.
// PARALLAX: as camadas (céu, constelações e logo) se movem em quantidades diferentes
// quando o mouse anda, o que dá sensação de profundidade. Quem usa "reduzir movimento" no
// sistema vê tudo parado.
// Tudo é SVG/CSS próprio: sem imagem externa e sem emoji.
import { useEffect, useRef } from "react";
import LogoOasys from "@/components/LogoOasys";

// Gerador de números "aleatórios" fixos (mulberry32): o céu fica sempre igual em toda visita.
function gerador(semente: number) {
  return () => {
    semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Céu de fundo: 110 estrelas bem pequenas, quase todas brancas e algumas levemente
// quentes ou frias, como no céu de verdade. Brilho (opacidade) varia bastante.
const sorteio = gerador(11);
const TONS = ["#ffffff", "#ffffff", "#ffffff", "#fde9b0", "#cfe0ff"];
const CEU = Array.from({ length: 110 }, () => ({
  x: sorteio() * 800,
  y: sorteio() * 900,
  r: 0.35 + Math.pow(sorteio(), 3) * 1.1, // a maioria é bem pequena, poucas maiores
  o: 0.15 + sorteio() * 0.5,
  cor: TONS[Math.floor(sorteio() * TONS.length)],
}));

// Uma estrela de constelação: posição e "magnitude" visual (tamanho). Quanto maior, mais brilhante.
type Estrela = [x: number, y: number, tamanho: number];
interface Constelacao {
  nome: string;
  estrelas: Estrela[];
  linhas: [number, number][]; // pares de índices de estrelas que se ligam
  rotulo: [x: number, y: number];
}

const CONSTELACOES: Constelacao[] = [
  {
    // Cruzeiro do Sul: a constelação mais ligada ao céu do Brasil
    nome: "Cruzeiro do Sul",
    estrelas: [[150, 108, 2.4], [150, 214, 3.2], [108, 158, 2.2], [192, 146, 2], [171, 178, 1.2]],
    linhas: [[0, 1], [2, 3]],
    rotulo: [92, 246],
  },
  {
    // Órion: ombros, cinturão de três estrelas e pés
    nome: "Órion",
    estrelas: [[640, 100, 3], [730, 116, 2.3], [690, 72, 1.5], [656, 186, 2], [686, 181, 2.2], [716, 176, 2], [650, 258, 2.4], [742, 252, 3.2]],
    linhas: [[2, 0], [2, 1], [0, 3], [1, 5], [3, 4], [4, 5], [3, 6], [5, 7]],
    rotulo: [668, 290],
  },
  {
    // Cassiopeia: o "W" no canto de baixo
    nome: "Cassiopeia",
    estrelas: [[598, 664, 2.1], [634, 700, 2.5], [670, 672, 2.2], [708, 710, 2.1], [748, 678, 2.7]],
    linhas: [[0, 1], [1, 2], [2, 3], [3, 4]],
    rotulo: [628, 744],
  },
];

// Estrelas que piscam devagar (só algumas, e em tempos diferentes, como no céu de verdade)
const PISCA: Record<string, number[]> = { "Cruzeiro do Sul": [1], "Órion": [0, 7], "Cassiopeia": [4] };

// Quanto cada camada anda (em pixels) quando o mouse vai de um canto ao outro.
// Camadas distantes andam pouco; as próximas andam mais.
const PROFUNDIDADE = { ceu: 8, constelacoes: 18, logo: 40 };

export default function ArteLogin() {
  const raiz = useRef<HTMLDivElement>(null);

  // Parallax: acompanha o mouse na janela toda e grava a posição (de -1 a 1) em duas
  // variáveis CSS. Cada camada usa essas variáveis para se deslocar (ver o estilo abaixo).
  useEffect(() => {
    const elemento = raiz.current;
    if (!elemento) return;
    // Respeita quem pede menos movimento no sistema (acessibilidade)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let quadro = 0; // controla o requestAnimationFrame para não atualizar mais que 1 vez por quadro
    const aoMover = (e: PointerEvent) => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 2 - 1; // -1 (esquerda) a 1 (direita)
        const y = (e.clientY / window.innerHeight) * 2 - 1; // -1 (topo) a 1 (base)
        elemento.style.setProperty("--mx", x.toFixed(3));
        elemento.style.setProperty("--my", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", aoMover);
    return () => {
      window.removeEventListener("pointermove", aoMover);
      cancelAnimationFrame(quadro);
    };
  }, []);

  // Estilo de uma camada: desloca em sentido oposto ao do mouse, proporcional à profundidade.
  // A transição suaviza o movimento. As camadas são maiores que a tela (-6%) para a borda
  // nunca aparecer quando elas se deslocam.
  const camada = (px: number) => ({
    transform: `translate3d(calc(var(--mx, 0) * ${-px}px), calc(var(--my, 0) * ${-px}px), 0)`,
  });

  return (
    <div ref={raiz} className="relative h-full min-h-screen w-full overflow-hidden bg-fundo">
      {/* Brilhos de fundo (fixos): violeta no centro e um toque dourado no alto, a "Lenda" */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(109,40,217,0.42), rgba(109,40,217,0.12) 38%, transparent 66%), radial-gradient(circle at 88% 6%, rgba(253,224,71,0.14), transparent 42%)",
        }}
      />

      {/* Camada 1: céu distante (anda pouco) */}
      <div className="parallax-camada absolute -inset-[6%]" style={camada(PROFUNDIDADE.ceu)} aria-hidden="true">
        <svg viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {CEU.map((e, i) => (
            <circle key={i} cx={e.x} cy={e.y} r={e.r} fill={e.cor} opacity={e.o} />
          ))}
        </svg>
      </div>

      {/* Camada 2: constelações */}
      <div className="parallax-camada absolute -inset-[6%]" style={camada(PROFUNDIDADE.constelacoes)} aria-hidden="true">
        <svg viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {/* Recuo de 30 px à esquerda: sobra margem para o parallax não cortar Órion e Cassiopeia na borda */}
          <g transform="translate(-30 0)">
          {CONSTELACOES.map((c) => (
            <g key={c.nome}>
              {/* Linhas finas entre as estrelas (traço bem leve, como um mapa celeste) */}
              {c.linhas.map(([a, b], i) => (
                <line
                  key={i}
                  x1={c.estrelas[a][0]} y1={c.estrelas[a][1]}
                  x2={c.estrelas[b][0]} y2={c.estrelas[b][1]}
                  stroke="#c4b5fd" strokeOpacity="0.32" strokeWidth="0.8"
                />
              ))}
              {c.estrelas.map(([x, y, t], i) => {
                const brilhante = t >= 2.4; // as maiores ganham uma pequena cruz de luz
                const pisca = PISCA[c.nome]?.includes(i);
                return (
                  <g key={i} className={pisca ? "estrela-pisca" : undefined} style={{ animationDelay: `${-i * 2.3}s` }}>
                    {brilhante && (
                      <path
                        d={`M${x - t * 3.2} ${y}H${x + t * 3.2}M${x} ${y - t * 3.2}V${y + t * 3.2}`}
                        stroke="#f5f3ff" strokeOpacity="0.4" strokeWidth="0.7"
                      />
                    )}
                    <circle cx={x} cy={y} r={t * 0.75} fill="#f8f6ff" />
                  </g>
                );
              })}
              {/* Nome da constelação, pequeno e discreto */}
              <text
                x={c.rotulo[0]} y={c.rotulo[1]}
                fill="#c4b5fd" fillOpacity="0.4" fontSize="10.5" letterSpacing="2.5"
                fontFamily="DM Sans, sans-serif"
              >
                {c.nome.toUpperCase()}
              </text>
            </g>
          ))}
          </g>
        </svg>
      </div>

      {/* Camada 3: logo oficial no centro (a que mais se move, por estar "mais perto") */}
      <div className="parallax-camada absolute inset-0 grid place-items-center" style={camada(PROFUNDIDADE.logo)}>
        <div className="drop-shadow-[0_0_40px_rgba(167,139,250,0.55)]">
          <LogoOasys tamanho={190} />
        </div>
      </div>

      {/* Escurece a base para o texto ficar legível */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-fundo to-transparent" />

      {/* Frase de apresentação */}
      <div className="absolute inset-x-10 bottom-10">
        <p className="font-titulo text-4xl font-bold leading-tight">
          Descubra seu <span className="font-destaque text-[1.1em] italic text-violeta">próximo</span> jogo.
        </p>
        <p className="mt-3 max-w-md text-sm text-white/65">
          Catálogo, comunidade e conquistas em um só lugar. Do Ferro à Lenda Absoluta.
        </p>
      </div>
    </div>
  );
}
