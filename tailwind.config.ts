// Tema do OASYS, extraído do protótipo da home (design/oasys-home-prototipo.html).
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fundo: "#0c0e14",
        painel: "#13161f",
        linha: "rgb(255 255 255 / 0.08)",
        violeta: { DEFAULT: "#a78bfa", escuro: "#6d28d9" },
        azul: "#3b82f6",
        ouro: "#fde047",
      },
      fontFamily: {
        titulo: ["Outfit", "sans-serif"],
        texto: ["DM Sans", "sans-serif"],
        destaque: ["Instrument Serif", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
