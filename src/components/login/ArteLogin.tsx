// Arte da tela de login (RF01): "Portal do OASYS".
// A logo oficial fica no centro, cercada por anéis que giram bem devagar. Na órbita externa
// estão os 10 elos (do Ferro à Lenda Absoluta), um ponto de cada cor.
// Tudo é SVG/CSS próprio: sem imagem externa e sem emoji. Quem usa "reduzir movimento" no
// sistema vê a arte parada (a regra fica no src/index.css).
import { ELOS } from "@/lib/elos";
import LogoOasys from "@/components/LogoOasys";

// Gerador de números "aleatórios" fixos (mulberry32): as estrelas ficam sempre nos mesmos
// lugares, então a arte é igual em toda visita e não "pula" a cada renderização.
function gerador(semente: number) {
  return () => {
    semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 60 estrelas pequenas espalhadas no quadro de 800 x 900
const sorteio = gerador(7);
const ESTRELAS = Array.from({ length: 60 }, () => ({
  x: sorteio() * 800,
  y: sorteio() * 900,
  r: 0.6 + sorteio() * 1.4,
  o: 0.25 + sorteio() * 0.6,
}));

// Centro do portal e raio da órbita dos elos
const CX = 400;
const CY = 450;
const RAIO_ELOS = 290;

export default function ArteLogin() {
  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden bg-fundo">
      <svg viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          {/* Brilho violeta no centro, atrás da logo */}
          <radialGradient id="portal-brilho" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#6d28d9" stopOpacity="0.18" />
            <stop offset="1" stopColor="#6d28d9" stopOpacity="0" />
          </radialGradient>
          {/* Brilho dourado discreto no alto: a "Lenda" */}
          <radialGradient id="portal-ouro" cx="0.85" cy="0.08" r="0.5">
            <stop offset="0" stopColor="#fde047" stopOpacity="0.16" />
            <stop offset="1" stopColor="#fde047" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="800" height="900" fill="url(#portal-ouro)" />
        <circle cx={CX} cy={CY} r="380" fill="url(#portal-brilho)" className="portal-respira" />

        {/* Estrelas */}
        {ESTRELAS.map((e, i) => (
          <circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#fff" opacity={e.o} />
        ))}

        {/* Anéis: cada um gira num ritmo e sentido diferentes (60 a 150 segundos por volta) */}
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

      {/* Logo oficial no centro, com brilho suave atrás */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_40px_rgba(167,139,250,0.55)]">
        <LogoOasys tamanho={190} />
      </div>

      {/* Escurece a base para o texto ficar legível */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-fundo to-transparent" />

      {/* Frase de apresentação */}
      <div className="absolute inset-x-10 bottom-10">
        <p className="font-titulo text-4xl font-bold leading-tight">
          Descubra seu <span className="font-destaque italic text-violeta text-[1.1em]">próximo</span> jogo.
        </p>
        <p className="mt-3 max-w-md text-sm text-white/65">
          Catálogo, comunidade e conquistas em um só lugar. Do Ferro à Lenda Absoluta.
        </p>
      </div>
    </div>
  );
}
