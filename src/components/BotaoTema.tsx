// Botão que alterna entre modo escuro e modo claro: um interruptor onde a bolinha vira sol ou lua.
// Usado no cabeçalho (Layout) e na tela de login. O desenho e a animação vêm do CSS em src/index.css (classes "tema-*"),
// baseado no interruptor de satyamchaudharydev (Uiverse.io).
//
// Acessibilidade: é um checkbox de verdade (funciona com teclado: Tab e Espaço) e tem rótulo para leitor de tela.
// Marcado = noite = modo escuro.

import { useTema } from "@/hooks/useTema";

export default function BotaoTema({ className }: { className?: string }) {
  const { tema, alternar } = useTema();
  const escuro = tema === "escuro";

  return (
    <label className={`tema-switch ${className ?? ""}`} title={escuro ? "Mudar para o modo claro" : "Mudar para o modo escuro"}>
      <input type="checkbox" role="switch" checked={escuro} onChange={alternar} aria-label="Modo escuro" />
      <span className="tema-slider" />
    </label>
  );
}
