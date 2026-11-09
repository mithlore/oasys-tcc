// Botão que alterna entre modo escuro e modo claro: um interruptor onde o sol vira lua.
// Usado no cabeçalho (Layout) e na tela de login. O desenho vem do CSS em src/index.css (classes "tema-*"),
// baseado no toggle de mobinkakei (Uiverse.io).
//
// Acessibilidade: é um checkbox de verdade (funciona com teclado: Tab e Espaço) e tem rótulo para leitor de tela.
// Marcado = noite = modo escuro.

import { useTema } from "@/hooks/useTema";

export default function BotaoTema({ className }: { className?: string }) {
  const { tema, alternar } = useTema();
  const escuro = tema === "escuro";

  return (
    <span className={`tema-caixa ${className ?? ""}`} title={escuro ? "Mudar para o modo claro" : "Mudar para o modo escuro"}>
      <label className="tema-toggle">
        <input
          className="tema-input"
          type="checkbox"
          role="switch"
          checked={escuro}
          onChange={alternar}
          aria-label="Modo escuro"
        />
        <span className="tema-trilho" aria-hidden="true">
          <span className="tema-manopla">
            {/* crateras da lua (aparecem só à noite) */}
            <span className="tema-cratera c1" />
            <span className="tema-cratera c2" />
            <span className="tema-cratera c3" />
          </span>
          {/* nuvens (dia) que viram estrelas (noite) */}
          <span className="tema-estrela e1" />
          <span className="tema-estrela e2" />
          <span className="tema-estrela e3" />
          <span className="tema-estrela e4" />
          <span className="tema-estrela e5" />
          <span className="tema-estrela e6" />
        </span>
      </label>
    </span>
  );
}
