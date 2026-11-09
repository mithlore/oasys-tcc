// Escrita própria do nome "OASYS", desenhada em SVG (traços), sem depender de fonte.
// Usada no cabeçalho (Layout) e na tela de login. Identidade visual do projeto (não é um requisito RF/RN).
//
// Todas as letras seguem a mesma grade: linha central entre y=14 e y=50, traço de 6, pontas arredondadas,
// e 10 unidades de espaço entre elas. Cada letra tem um detalhe que a deixa única:
//   O = anel aberto embaixo com um ponto no centro (um "oásis"); A = a travessa vira um traço solto;
//   S = cortado na diagonal, no meio; Y = a haste tem um pequeno vão.
// Os cortes são feitos com "máscaras" (a parte preta da máscara fica transparente), então valem em qualquer fundo.
// As cores do degradê vêm das variáveis do tema (index.css), por isso acompanham o modo claro/escuro.

import { useId } from "react";

type Props = {
  altura?: number; // altura em pixels (a largura acompanha a proporção)
  className?: string;
};

// Caminho do S, desenhado a partir de x0 (posição do lado esquerdo da letra). Usado nas duas letras S.
const caminhoS = (x0: number) =>
  `M${x0 + 28} 22 C${x0 + 26} 11 ${x0 + 2} 11 ${x0 + 2} 23 C${x0 + 2} 34 ${x0 + 30} 28 ${x0 + 30} 41 C${x0 + 30} 53 ${x0 + 6} 53 ${x0} 44`;

export default function WordmarkOasys({ altura = 24, className }: Props) {
  // ids únicos, para o degradê e as máscaras não colidirem se o componente aparecer mais de uma vez na tela
  const id = useId().replace(/:/g, "");
  const grad = `${id}g`;
  const corteS1 = `${id}s1`;
  const corteS2 = `${id}s2`;
  const corteY = `${id}y`;

  // Uma máscara = um retângulo branco (tudo visível) + uma risca preta (o corte)
  const mascara = (mid: string, risca: string, espessura: number) => (
    <mask id={mid} maskUnits="userSpaceOnUse" x="0" y="0" width="260" height="64">
      <rect width="260" height="64" fill="#fff" />
      <path d={risca} stroke="#000" strokeWidth={espessura} />
    </mask>
  );

  return (
    <svg
      viewBox="0 0 248 64"
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
        {/* degradê na largura toda (userSpaceOnUse faz as letras dividirem o mesmo degradê) */}
        <linearGradient id={grad} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="248" y2="0">
          <stop offset="0" style={{ stopColor: "rgb(var(--c-marca-a))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--c-marca-b))" }} />
        </linearGradient>
        {mascara(corteS1, "M108 36 L144 28", 4.5)}
        {mascara(corteS2, "M204 36 L240 28", 4.5)}
        {mascara(corteY, "M166 42 L182 42", 3.5)}
      </defs>

      {/* O: anel aberto embaixo + ponto no centro */}
      <path d="M17.5 48.3 A17 18 0 1 1 30.5 48.3" />
      <circle cx="24" cy="32" r="3.2" fill={`url(#${grad})`} stroke="none" />

      {/* A: dois traços inclinados; a travessa é um traço curto e mais fino, solto */}
      <path d="M57 50 L76 14 L95 50" />
      <path d="M68.5 40 L83.5 40" strokeWidth={4} />

      {/* S (primeiro), com corte diagonal */}
      <g mask={`url(#${corteS1})`}>
        <path d={caminhoS(111)} />
      </g>

      {/* Y: braços + haste com um pequeno vão no meio da haste */}
      <g mask={`url(#${corteY})`}>
        <path d="M157 14 L174 33 L191 14" />
        <path d="M174 33 L174 50" />
      </g>

      {/* S (segundo), com corte diagonal */}
      <g mask={`url(#${corteS2})`}>
        <path d={caminhoS(207)} />
      </g>
    </svg>
  );
}
