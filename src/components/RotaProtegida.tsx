// Barreira de acesso: sem login, a pessoa é levada para /login (RF01: todo conteúdo exige login).
// Importante: isto só controla a TELA. Os dados em si são protegidos pelo RLS no banco (RNF01),
// então mesmo quem burlar esta barreira não consegue ler nada sem estar autenticado.
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { IconeCarregando } from "@/components/icons/Icones";

export default function RotaProtegida() {
  const { usuario, carregando } = useAuth();
  const local = useLocation();

  // Enquanto o navegador confere se já há sessão salva, mostramos um indicador (e não o login),
  // para quem já está logado não ver a tela de login piscar a cada recarga.
  if (carregando) {
    return (
      <div className="grid min-h-screen place-items-center text-tinta/60" role="status" aria-label="Carregando">
        <IconeCarregando className="h-7 w-7 animate-spin" />
      </div>
    );
  }
  // Sem login: vai para /login e guarda a página que a pessoa queria, para voltar depois de entrar.
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  return <Outlet />;
}
