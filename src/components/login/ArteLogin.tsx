// Arte da tela de login (RF01): ilustração original em SVG, sem imagens externas e sem emoji.
// Ideia visual: os 10 elos do OASYS formam uma trilha que sobe até a Lenda Absoluta, com
// cartas de colecionáveis ao fundo e órbitas (as mesmas formas da home).
// Só há movimento na ENTRADA (os elos acendem em sequência, uma vez). Nada fica animado
// o tempo todo, e quem usa "reduzir movimento" no sistema vê a arte já pronta.
import { ELOS } from "@/lib/elos";

// Gerador de números "aleatórios" fixos (mulberry32): as estrelas ficam sempre nos mesmos lugares,
// então a arte é igual em toda visita e não "pula" a cada renderização.
function gerador(semente: number) {
  return () => {
    semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Estrelas pequenas espalhadas pelo fundo.
const sorteio = gerador(2026);
const ESTRELAS = Array.from({ length: 46 }, () => ({
  x: sorteio() * 800,
  y: sorteio() * 560,
  r: 0.6 + sorteio() * 1.4,
  o: 0.25 + sorteio() * 0.55,
}));

// Posição de cada elo na trilha: sobe da esquerda-baixo para a direita-cima, com uma leve onda.
const TRILHA = ELOS.map((elo, i) => {
  const t = i / (ELOS.length - 1); // 0 no Ferro, 1 na Lenda Absoluta
  return {
    elo,
    x: 120 + t * 570,
    y: 690 - t * 395 - 48 * Math.sin(t * Math.PI * 1.4), // começa acima do texto do rodapé
    tamanho: 15 + t * 17, // o losango cresce a cada elo
  };
});

// Linha que liga os elos (passa por todos os pontos).
const CAMINHO = TRILHA.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

/** Carta de colecionável abstrata: moldura, "sol" e montanhas. Desenho próprio, sem personagens. */
function Carta({ x, y, giro, cor, cor2, id }: { x: number; y: number; giro: number; cor: string; cor2: string; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      <defs>
        <linearGradient id={`carta-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cor2} />
          <stop offset="1" stopColor={cor} />
        </linearGradient>
        <clipPath id={`recorte-${id}`}>
          <rect x="-58" y="-82" width="116" height="164" rx="12" />
        </clipPath>
      </defs>
      <rect x="-58" y="-82" width="116" height="164" rx="12" fill={`url(#carta-${id})`} opacity="0.9" />
      <g clipPath={`url(#recorte-${id})`}>
        <circle cx="16" cy="-30" r="20" fill="#fff" opacity="0.28" />
        <path d="M-70 62 L-22 -2 L8 38 L30 12 L70 62 Z" fill="#0c0e14" opacity="0.45" />
        <path d="M-70 82 L-30 30 L4 66 L36 34 L70 82 Z" fill="#0c0e14" opacity="0.65" />
      </g>
      <rect x="-58" y="-82" width="116" height="164" rx="12" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
    </g>
  );
}

export default function ArteLogin() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0c12]">
      <svg
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Ilustração: os dez elos do OASYS subindo em uma trilha até a Lenda Absoluta"
      >
        <defs>
          <linearGradient id="fundo-login" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0c0e14" />
            <stop offset="0.55" stopColor="#150b2b" />
            <stop offset="1" stopColor="#2a0f4a" />
          </linearGradient>
          <radialGradient id="brilho-login" cx="0.3" cy="0.95" r="0.8">
            <stop offset="0" stopColor="#7c3aed" stopOpacity="0.55" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="brilho-topo" cx="0.85" cy="0.12" r="0.55">
            <stop offset="0" stopColor="#fde047" stopOpacity="0.22" />
            <stop offset="1" stopColor="#fde047" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="trilha" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#52525b" />
            <stop offset="0.5" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#fde047" />
          </linearGradient>
          <filter id="halo" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        {/* Fundo: degradê, brilho violeta embaixo e brilho dourado no alto (a "Lenda") */}
        <rect width="800" height="900" fill="url(#fundo-login)" />
        <rect width="800" height="900" fill="url(#brilho-login)" />
        <rect width="800" height="900" fill="url(#brilho-topo)" />

        {/* Estrelas */}
        {ESTRELAS.map((e, i) => (
          <circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#fff" opacity={e.o} />
        ))}

        {/* Órbitas, as mesmas formas da home */}
        <g fill="none" stroke="#fff">
          <circle cx="400" cy="640" r="150" strokeOpacity="0.07" />
          <circle cx="400" cy="640" r="250" strokeOpacity="0.06" strokeDasharray="2 10" />
          <circle cx="400" cy="640" r="360" strokeOpacity="0.06" />
          <circle cx="400" cy="640" r="480" strokeOpacity="0.045" />
        </g>

        {/* Cartas de colecionáveis ao fundo (o Santuário) */}
        <g opacity="0.85">
          <Carta id="a" x={170} y={250} giro={-14} cor="#0d9488" cor2="#5eead4" />
          <Carta id="b" x={330} y={190} giro={-3} cor="#6d28d9" cor2="#c4b5fd" />
          <Carta id="c" x={500} y={235} giro={11} cor="#b45309" cor2="#fde047" />
        </g>

        {/* Trilha que liga os elos */}
        <path d={CAMINHO} fill="none" stroke="url(#trilha)" strokeWidth="2" strokeOpacity="0.55" strokeLinejoin="round" strokeDasharray="3 7" />

        {/* Os 10 elos: acendem um a um (animação de entrada, uma vez) */}
        {TRILHA.map((p, i) => {
          const ultimo = i === TRILHA.length - 1;
          const d = p.tamanho;
          const losango = `M0 ${-d} L${d} 0 L0 ${d} L${-d} 0 Z`;
          return (
            <g key={p.elo.chave} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
              <g className="elo-surgindo" style={{ animationDelay: `${300 + i * 140}ms` }}>
                <defs>
                  <linearGradient id={`elo-login-${p.elo.chave}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={p.elo.cor2} />
                    <stop offset="1" stopColor={p.elo.cor} />
                  </linearGradient>
                </defs>
                {/* Brilho atrás: mais forte nos elos altos, como no app antigo */}
                {(p.elo.efeitos !== "simples" || ultimo) && (
                  <path d={losango} fill={p.elo.cor2} opacity={ultimo ? 0.7 : 0.4} filter="url(#halo)" transform="scale(1.5)" />
                )}
                <path d={losango} fill={`url(#elo-login-${p.elo.chave})`} stroke="#000" strokeOpacity="0.55" strokeWidth="2.2" strokeLinejoin="round" />
                {ultimo && <path d={losango} fill="none" stroke="#fde047" strokeWidth="1.5" transform="scale(1.35)" opacity="0.8" />}
              </g>
            </g>
          );
        })}
      </svg>

      {/* Texto sobre a arte (HTML, para ficar nítido e acessível) */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0c12] via-[#0a0c12]/80 to-transparent px-10 pb-12 pt-32">
        <h2 className="font-titulo text-4xl font-bold leading-tight xl:text-5xl">
          Descubra seu <em className="font-destaque font-normal text-violeta">próximo</em> jogo.
        </h2>
        <p className="mt-3 max-w-md text-white/65">
          Catálogo, comunidade e conquistas em um só lugar. Do Ferro à Lenda Absoluta.
        </p>
      </div>
    </div>
  );
}
