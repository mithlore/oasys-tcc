// Rotas do OASYS. Cada tela vira uma página em src/pages (começam provisórias).
import { Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import Pagina from "@/pages/Pagina";
import Login from "@/pages/Login";
import RotaProtegida from "@/components/RotaProtegida";
import { supabaseConfigurado } from "@/lib/supabase";

export default function App() {
  return (
    <>
      {!supabaseConfigurado && (
        <div className="bg-yellow-500/15 px-4 py-2 text-center text-sm text-yellow-200">
          Supabase não configurado: copie .env.example para .env.local e preencha as duas variáveis.
        </div>
      )}
      <Routes>
        {/* /login é a única tela aberta a visitantes (RF01) */}
        <Route path="login" element={<Login />} />
        {/* Todo o resto exige login: RotaProtegida leva visitantes para /login */}
        <Route element={<RotaProtegida />}>
          <Route element={<Layout />}>
            <Route index element={<Pagina titulo="Início" requisitos="RF15, RF16, RF23, RF24 (home: design/oasys-home-prototipo.html)" />} />
            <Route path="catalogo" element={<Pagina titulo="Catálogo" requisitos="RF02" />} />
            <Route path="jogo/:id" element={<Pagina titulo="Página do jogo" requisitos="RF03, RF04, RF05" />} />
            <Route path="santuario" element={<Pagina titulo="Santuário" requisitos="RF17, RF22" />} />
            <Route path="colecao" element={<Pagina titulo="Coleção" requisitos="RF17" />} />
            <Route path="amigos" element={<Pagina titulo="Amigos e mensagens" requisitos="RF10, RF13" />} />
            <Route path="feed" element={<Pagina titulo="Feed" requisitos="RF11, RF12" />} />
            <Route path="arquetipos" element={<Pagina titulo="Arquétipos" requisitos="RF14" />} />
            <Route path="*" element={<Pagina titulo="Página não encontrada" requisitos="-" />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
