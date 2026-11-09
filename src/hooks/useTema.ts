// Hook do tema (modo claro / escuro) do site. Usado pelo botão BotaoTema (cabeçalho e tela de login).
// Não é um requisito funcional: é uma preferência visual do usuário (conforto de leitura).
//
// Como funciona: o modo claro é a classe "claro" na tag <html> (as cores vêm de variáveis CSS, veja index.css).
// A escolha fica salva no navegador (localStorage) só para lembrar na próxima visita; não envolve nenhum benefício
// do jogo (XP, check-in), então não há problema em ficar no cliente (RNF02 não se aplica).

import { useCallback, useEffect, useState } from "react";

const CHAVE = "oasys-tema"; // nome da preferência guardada no navegador

export type Tema = "claro" | "escuro";

// Lê o tema que já está aplicado na página (o script do index.html aplica o salvo antes de desenhar)
function temaAtual(): Tema {
  return document.documentElement.classList.contains("claro") ? "claro" : "escuro";
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaAtual);

  // Mantém vários botões na tela sincronizados: quando um muda, os outros recebem o aviso
  useEffect(() => {
    const aoMudar = () => setTema(temaAtual());
    window.addEventListener("oasys-tema", aoMudar);
    return () => window.removeEventListener("oasys-tema", aoMudar);
  }, []);

  // Aplica o tema na tag <html> e lembra a escolha
  const definir = useCallback((novo: Tema) => {
    document.documentElement.classList.toggle("claro", novo === "claro");
    try {
      localStorage.setItem(CHAVE, novo); // pode falhar em aba anônima: tudo bem, só não lembra
    } catch {
      /* sem armazenamento: o tema vale só nesta visita */
    }
    window.dispatchEvent(new Event("oasys-tema"));
  }, []);

  const alternar = useCallback(() => definir(temaAtual() === "claro" ? "escuro" : "claro"), [definir]);

  return { tema, definir, alternar };
}
