// Tema do OASYS, extraído do protótipo da home (design/oasys-home-prototipo.html).
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cada cor lê uma variável CSS (definida em src/index.css), uma para o tema escuro e outra para o claro.
        // O "<alpha-value>" deixa classes como bg-violeta/15 e text-tinta/60 continuarem funcionando.
        fundo: "rgb(var(--c-fundo) / <alpha-value>)",
        painel: "rgb(var(--c-painel) / <alpha-value>)",
        tinta: "rgb(var(--c-tinta) / <alpha-value>)", // cor do texto e dos contornos suaves (branco no escuro, roxo-escuro no claro)
        linha: "rgb(var(--c-tinta) / calc(<alpha-value> * var(--a-linha)))",
        violeta: { DEFAULT: "rgb(var(--c-violeta) / <alpha-value>)", escuro: "rgb(var(--c-violeta-escuro) / <alpha-value>)" },
        azul: "rgb(var(--c-azul) / <alpha-value>)",
        ouro: "rgb(var(--c-ouro) / <alpha-value>)",
      },
      // Animação de entrada discreta: sobe 8 px e aparece em 220 ms (sem efeitos constantes).
      keyframes: {
        entrar: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { entrar: "entrar 220ms ease-out both" },
      fontFamily: {
        titulo: ["Outfit", "sans-serif"],
        texto: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
