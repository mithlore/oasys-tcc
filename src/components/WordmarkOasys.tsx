// Escrita própria do nome "OASYS", desenhada em SVG (traços), sem depender de fonte.
// Usada no cabeçalho (Layout) e na tela de login. Identidade visual do projeto (não é um requisito RF/RN).
//
// Cada letra é um "traço" com ponta arredondada, e tem um detalhe que a deixa única:
//   O = anel aberto com um tracinho solto; A = sem travessa (ela vira um traço solto);
//   S = cortada na diagonal, no meio; Y = com um pequeno vão na haste.
// O corte do S é feito com uma "máscara" (parte que fica transparente), então funciona em qualquer fundo.

import { useId } from "react";

type Props = {
  altura?: number; // altura em pixels (a largura acompanha a proporção)
  className?: string;
};

export default function WordmarkOasys({ altura = 24, className }: Props) {
  // ids únicos, para o degradê e as máscaras não colidirem se o componente aparecer 2 vezes na tela
  const id = useId().replace(/:/g, "");
  const corte1 = `${id}c1`;
  const corte2 = `${id}c2`;
  const grad = `${id}g`;

  // O mesmo desenho do S, usado duas vezes (só muda a posição horizontal)
  const desenhoS = "M168 17 C162 8 138 9 138 21 C138 33 170 28 170 42 C170 54 146 54 138 46";

  return (
    <svg
      viewBox="0 0 320 64"
      height={altura}
      className={className}
      fill="none"
      stroke={`url(#${grad})`}
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="OASYS"
    >
      <defs>
        {/* degradê lavanda → violeta, na largura toda (userSpaceOnUse faz as letras dividirem o mesmo degradê) */}
        <linearGradient id={grad} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="320" y2="0">
          <stop offset="0" style={{ stopColor: "rgb(var(--c-marca-a))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--c-marca-b))" }} />
        </linearGradient>
        {/* máscaras: tudo branco aparece; a risca preta é o "corte" diagonal no meio de cada S */}
        <mask id={corte1} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="64">
          <rect width="320" height="64" fill="#fff" />
          <path d="M136 36 L172 27" stroke="#000" strokeWidth={4.5} />
        </mask>
        <mask id={corte2} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="64">
          <rect width="320" height="64" fill="#fff" />
          <path d="M252 36 L288 27" stroke="#000" strokeWidth={4.5} />
        </mask>
      </defs>

      {/* O: anel aberto + tracinho solto no vão */}
      <path d="M44 26 A19 19 0 1 1 36 13" />
      <path d="M43 11 L51 7" strokeWidth={4} />

      {/* A: dois traços inclinados; a travessa é um traço curto solto */}
      <path d="M70 54 L92 10 L114 54" />
      <path d="M84 41 L100 41" strokeWidth={4} />

      {/* S (primeiro), com corte diagonal */}
      <g mask={`url(#${corte1})`}>
        <path d={desenhoS} />
      </g>

      {/* Y: braços + haste com um pequeno vão */}
      <path d="M184 10 L203 33 L222 10" />
      <path d="M203 33 L203 41" />
      <path d="M203 47 L203 54" />

      {/* S (segundo), com corte diagonal; deslocado 116 unidades para a direita */}
      <g mask={`url(#${corte2})`}>
        <path d={desenhoS} transform="translate(116 0)" />
      </g>
    </svg>
  );
}
