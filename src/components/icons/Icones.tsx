// Ícones do OASYS em SVG próprio. Regra dos autores: nenhum emoji no site.
// Todos usam `currentColor` (herdam a cor do texto) e o mesmo traço, para parecerem uma família.
// Para criar um ícone novo: copie um dos abaixo, troque o desenho (<path>) e dê um nome em português.
import type { SVGProps } from "react";

/** Base comum: caixa 24x24, só contorno, ponta arredondada. `aria-hidden` porque é decorativo. */
function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

/** Envelope (campo de e-mail). */
export const IconeEmail = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7.5 8 6 8-6" />
  </Base>
);

/** Cadeado (campo de senha). */
export const IconeSenha = (p: P) => (
  <Base {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Base>
);

/** Olho aberto (mostrar senha). */
export const IconeOlho = (p: P) => (
  <Base {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Base>
);

/** Olho riscado (esconder senha). */
export const IconeOlhoFechado = (p: P) => (
  <Base {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.7A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.1 3.9M6.6 7.6A15.6 15.6 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-.9" />
    <path d="M9.9 9.9a2.8 2.8 0 0 0 4.2 3.7" />
  </Base>
);

/** Triângulo de aviso (mensagens de erro). */
export const IconeAlerta = (p: P) => (
  <Base {...p}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" />
    <path d="M12 10v4.2M12 17h.01" />
  </Base>
);

/** Marca de confirmação (mensagens de sucesso). */
export const IconeConfirmar = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.3 2.8 2.8L16 9.5" />
  </Base>
);

/** Seta saindo da porta (sair da conta). */
export const IconeSair = (p: P) => (
  <Base {...p}>
    <path d="M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4" />
    <path d="M10 8 5.5 12 10 16M5.5 12H15" />
  </Base>
);

/** Estrela de 4 pontas (usada no lugar dos símbolos ★ e ✦ do protótipo). */
export const IconeBrilho = (p: P) => (
  <Base {...p}>
    <path d="M12 3.5c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7Z" />
  </Base>
);

/** Anel girando (carregando). A animação fica no CSS (`animate-spin` do Tailwind). */
export const IconeCarregando = (p: P) => (
  <Base {...p}>
    <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
  </Base>
);

/**
 * Losango do elo (rank). Recebe as duas cores do elo (veja src/lib/elos.ts) e pinta um degradê.
 * O `id` do degradê é único por cor para dois losangos na mesma tela não se misturarem.
 */
export function IconeElo({ cor, cor2, ...p }: P & { cor: string; cor2: string }) {
  const id = `elo-${cor.replace("#", "")}-${cor2.replace("#", "")}`;
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...p}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cor2} />
          <stop offset="1" stopColor={cor} />
        </linearGradient>
      </defs>
      <path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Z" fill={`url(#${id})`} stroke="rgb(0 0 0 / 0.45)" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
}
