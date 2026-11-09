// Arte da tela de login (RF01): "Portal do OASYS".
// A logo oficial fica no centro, cercada por anéis que giram bem devagar. Na órbita externa
// estão os 10 elos (do Ferro à Lenda Absoluta), um ponto de cada cor.
// O fundo é um céu com estrelas pequenas de brilhos e tons diferentes.
// PARALLAX: as camadas (céu, anéis e logo) se movem em quantidades diferentes
// quando o mouse anda, o que dá sensação de profundidade. Quem usa "reduzir movimento" no
// sistema vê tudo parado.
// Tudo é SVG/CSS próprio: sem imagem externa e sem emoji.
import { useEffect, useRef } from "react";
import { ELOS } from "@/lib/elos";
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

// Centro do portal e raio da órbita dos elos
const CX = 400;
const CY = 450;
const RAIO_ELOS = 290;

// Quanto cada camada anda (em pixels) quando o mouse vai de um canto ao outro.
// Camadas distantes andam pouco; as próximas andam mais.
const PROFUNDIDADE = { ceu: 8, aneis: 24, logo: 44 };

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

      {/* Camada 2: anéis e a órbita dos elos */}
      <div className="parallax-camada absolute -inset-[6%]" style={camada(PROFUNDIDADE.aneis)} aria-hidden="true">
        <svg viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {/* Anéis: cada um gira num ritmo e sentido diferentes (70 a 150 segundos por volta) */}
          <g fill="none" stroke="#a78bfa">
            <circle cx={CX} cy={CY} r="130" strokeOpacity="0.35" />
            <g className="portal-gira" style={{ animationDuration: "70s" }}>
              <circle cx={CX} cy={CY} r="180" strokeOpacity="0.45" strokeDasharray="2 8" />
            </g>
            <g className="portal-gira" style={{ animationDuration: "110s", animationDirection: "reverse" }}>
              <circle cx={CX} cy={CY} r="235" strokeOpacity="0.4" strokeDasharray="60 18 6 18" />
            </g>

            {/* Órbita externa com os 10 elos igualmente espaçados */}
            <g className="portal-gira" style={{ animationDuration: "150s" }}>
              <circle cx={CX} cy={CY} r={RAIO_ELOS} strokeOpacity="0.22" />
              {ELOS.map((elo, i) => {
                // ângulo de cada elo: 360° dividido em 10, começando no alto
                const ang = (i / ELOS.length) * Math.PI * 2 - Math.PI / 2;
                const x = CX + RAIO_ELOS * Math.cos(ang);
                const y = CY + RAIO_ELOS * Math.sin(ang);
                const ultimo = i === ELOS.length - 1; // Lenda Absoluta: maior e com halo dourado
                return (
                  <g key={elo.chave} stroke="none">
                    {ultimo && <circle cx={x} cy={y} r="20" fill="#fde047" opacity="0.22" />}
                    <circle cx={x} cy={y} r={ultimo ? 9 : 6} fill={elo.cor2} />
                  </g>
                );
              })}
            </g>
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
