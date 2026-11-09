// Tela provisória: mostra o nome da tela e o requisito que ela atende, até ser implementada.
export default function Pagina({ titulo, requisitos }: { titulo: string; requisitos: string }) {
  return (
    <section>
      <h1 className="font-titulo text-3xl font-bold">{titulo}</h1>
      <p className="mt-2 text-white/60">Em construção. Atende: {requisitos}.</p>
    </section>
  );
}
