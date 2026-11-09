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

  // Aplica o tema na tag <html> e lembra a escolha.
  // A troca é "pintada" de cima para baixo: usa a View Transitions API do navegador, que tira uma foto da tela
  // antes e depois da troca; o efeito em si (a máscara que desce) está em index.css ("tema-pintar").
  // Navegador sem suporte, ou usuário com "reduzir movimento": troca direto, sem animação.
  const definir = useCallback((novo: Tema) => {
    const html = document.documentElement;
    setTema(novo); // o botão já começa a deslizar na hora, sem esperar a troca de cores
    // Troca a classe, lembra a escolha e avisa os botões. Com a animação, isto roda no meio da transição.
    const aplicar = () => {
      html.classList.toggle("claro", novo === "claro");
      try {
        localStorage.setItem(CHAVE, novo); // pode falhar em aba anônima: tudo bem, só não lembra
      } catch {
        /* sem armazenamento: o tema vale só nesta visita */
      }
      window.dispatchEvent(new Event("oasys-tema"));
    };
    const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition === "function" && !semAnimacao) {
      // "tema-trocando" desliga as transições comuns durante o efeito, para a foto "depois" já sair com as cores finais
      // Espera 350 ms antes de pintar a tela: assim dá tempo de ver a bolinha do botão deslizar (0,4 s) primeiro
      window.setTimeout(() => {
        html.classList.add("tema-trocando");
        const transicao = document.startViewTransition(aplicar);
        void transicao.finished.finally(() => html.classList.remove("tema-trocando"));
      }, 350);
    } else {
      aplicar();
    }
  }, []);

  // usa o estado do botão (que muda na hora), assim dois cliques seguidos não se confundem
  const alternar = useCallback(() => definir(tema === "claro" ? "escuro" : "claro"), [definir, tema]);

  return { tema, definir, alternar };
}
