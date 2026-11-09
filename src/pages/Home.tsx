// Tela de Início (home). Monta as seções, cada uma em um componente pequeno (src/components/home/).
// Referência visual: design/oasys-home-prototipo.html. Atende RF15, RF16, RF24 (etapa 1 da conversão).
// As seções que dependem do catálogo (recomendações, ranking, biblioteca...) entram nas próximas etapas.
import HeroHome from "@/components/home/HeroHome";
import ProgressaoElos from "@/components/home/ProgressaoElos";

export default function Home() {
  return (
    <div className="grid gap-16">
      <HeroHome />
      <ProgressaoElos />
    </div>
  );
}
