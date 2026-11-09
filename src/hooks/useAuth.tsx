// Contexto de autenticação: guarda quem está logado e oferece entrar, cadastrar e sair (RF01).
// Quem confirma a identidade é o Supabase Auth (no servidor). Aqui só guardamos o resultado
// para a interface decidir o que mostrar. Usado por: RotaProtegida, Layout e a tela de Login.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { traduzirErroDeLogin } from "@/lib/validacao";

interface ResultadoAuth {
  /** Mensagem de erro já em português, ou null se deu certo. */
  erro: string | null;
}

interface ResultadoCadastro extends ResultadoAuth {
  /** Verdadeiro quando o projeto exige confirmar o e-mail antes de entrar. */
  precisaConfirmarEmail: boolean;
}

interface ContextoAuth {
  usuario: User | null;
  /** Verdadeiro enquanto ainda descobrimos se já existe uma sessão salva no navegador. */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<ResultadoAuth>;
  cadastrar: (email: string, senha: string) => Promise<ResultadoCadastro>;
  sair: () => Promise<void>;
}

const Contexto = createContext<ContextoAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // 1) Ao abrir o site: recupera a sessão salva (se a pessoa já tinha entrado antes).
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });
    // 2) Depois: o Supabase avisa sempre que alguém entra, sai ou o token é renovado.
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      setCarregando(false);
    });
    // Ao desmontar, para de escutar (evita vazamento de memória).
    return () => data.subscription.unsubscribe();
  }, []);

  const valor = useMemo<ContextoAuth>(
    () => ({
      usuario: sessao?.user ?? null,
      carregando,

      async entrar(email, senha) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
        return { erro: error ? traduzirErroDeLogin(error.message) : null };
      },

      async cadastrar(email, senha) {
        // O perfil (tabela profiles) é criado sozinho no banco por um gatilho (trigger) no cadastro.
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) return { erro: traduzirErroDeLogin(error.message), precisaConfirmarEmail: false };
        // Sem sessão devolvida = o Supabase está exigindo a confirmação por e-mail.
        return { erro: null, precisaConfirmarEmail: !data.session };
      },

      async sair() {
        await supabase.auth.signOut();
      },
    }),
    [sessao, carregando],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/** Atalho para usar o contexto nos componentes. */
export function useAuth(): ContextoAuth {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
