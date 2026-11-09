// Tela de entrada: "Entrar" e "Criar conta" (RF01). Atende RF01, RNF01 e RNF04.
// A validação aqui só avisa erros na hora; a segurança de verdade está no Supabase Auth.
import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabaseConfigurado } from "@/lib/supabase";
import { erroDaSenha, erroDoEmail, TAMANHO_MINIMO_SENHA } from "@/lib/validacao";
import { cn } from "@/lib/utils";
import ArteLogin from "@/components/login/ArteLogin";
import LogoOasys from "@/components/LogoOasys";
import WordmarkOasys from "@/components/WordmarkOasys";
import {
  IconeAlerta,
  IconeCarregando,
  IconeConfirmar,
  IconeEmail,
  IconeOlho,
  IconeOlhoFechado,
  IconeSenha,
} from "@/components/icons/Icones";

type Modo = "entrar" | "cadastrar";

export default function Login() {
  const { usuario, carregando, entrar, cadastrar } = useAuth();
  const local = useLocation();
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Quem já está logado não precisa desta tela: volta para a página que queria (ou para o início).
  if (!carregando && usuario) {
    const destino = (local.state as { de?: string } | null)?.de ?? "/";
    return <Navigate to={destino} replace />;
  }

  function trocarModo(novo: Modo) {
    setModo(novo);
    setErros({});
    setMensagemErro(null);
    setAviso(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setMensagemErro(null);
    setAviso(null);

    // 1) Valida os campos antes de falar com o servidor.
    const novosErros = {
      email: erroDoEmail(email) ?? undefined,
      // No login só exigimos que a senha não esteja vazia; as regras de força valem no cadastro.
      senha: modo === "cadastrar" ? erroDaSenha(senha) ?? undefined : senha ? undefined : "Informe a senha.",
    };
    setErros(novosErros);
    if (novosErros.email || novosErros.senha) return;

    // 2) Chama o Supabase Auth (entrar ou cadastrar).
    setEnviando(true);
    if (modo === "entrar") {
      const { erro } = await entrar(email, senha);
      if (erro) setMensagemErro(erro);
      // Se deu certo, o AuthProvider detecta a sessão e esta tela redireciona sozinha (acima).
    } else {
      const { erro, precisaConfirmarEmail } = await cadastrar(email, senha);
      if (erro) setMensagemErro(erro);
      else if (precisaConfirmarEmail) {
        setAviso("Conta criada. Enviamos um link de confirmação para o seu e-mail. Confirme e depois entre.");
        setModo("entrar");
        setSenha("");
      }
    }
    setEnviando(false);
  }

  return (
    // No computador: arte à esquerda e formulário à direita. No celular, só o formulário.
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="hidden lg:block" aria-label="Ilustração">
        <ArteLogin />
      </aside>
      <div className="grid place-items-center px-4 py-10">
      <div className="w-full max-w-md animate-entrar">
        {/* Logo oficial e nome, centralizados acima do formulário */}
        <div className="mb-8 flex flex-col items-center gap-3">
          {/* No computador a logo grande já está na arte ao lado; aqui ela só aparece no celular */}
          <LogoOasys tamanho={72} className="lg:hidden" />
          <WordmarkOasys altura={34} className="mx-auto" />
        </div>

        <div className="rounded-2xl border border-linha bg-painel p-6 sm:p-8">
          {/* Abas: alternam entre entrar e criar conta */}
          <div role="tablist" aria-label="Acesso" className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 p-1 text-sm">
            {(["entrar", "cadastrar"] as Modo[]).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={modo === m}
                onClick={() => trocarModo(m)}
                className={cn(
                  "rounded-lg px-3 py-2 font-medium transition-colors",
                  modo === m ? "bg-violeta/20 text-violeta" : "text-white/60 hover:text-white",
                )}
              >
                {m === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} noValidate className="space-y-4">
            <Campo
              id="email"
              rotulo="E-mail"
              tipo="email"
              autoComplete="email"
              valor={email}
              aoMudar={setEmail}
              erro={erros.email}
              icone={<IconeEmail className="h-5 w-5" />}
            />
            <Campo
              id="senha"
              rotulo="Senha"
              tipo={mostrarSenha ? "text" : "password"}
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              valor={senha}
              aoMudar={setSenha}
              erro={erros.senha}
              dica={modo === "cadastrar" ? `Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres, com letras e números.` : undefined}
              icone={<IconeSenha className="h-5 w-5" />}
              acao={
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? "Esconder a senha" : "Mostrar a senha"}
                  className="text-white/50 hover:text-white"
                >
                  {mostrarSenha ? <IconeOlhoFechado className="h-5 w-5" /> : <IconeOlho className="h-5 w-5" />}
                </button>
              }
            />

            {/* Mensagens do servidor. aria-live faz leitores de tela anunciarem o aviso. */}
            <div aria-live="polite">
              {mensagemErro && (
                <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  <IconeAlerta className="mt-0.5 h-4 w-4 shrink-0" /> {mensagemErro}
                </p>
              )}
              {aviso && (
                <p className="flex items-start gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  <IconeConfirmar className="mt-0.5 h-4 w-4 shrink-0" /> {aviso}
                </p>
              )}
              {!supabaseConfigurado && (
                <p className="rounded-lg bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
                  Supabase não configurado: preencha o arquivo .env.local.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={enviando || !supabaseConfigurado}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violeta-escuro to-violeta px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {enviando && <IconeCarregando className="h-5 w-5 animate-spin" />}
              {modo === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
      </div>
    </main>
  );
}

/** Campo de formulário com rótulo, ícone, mensagem de erro e botão opcional (ex.: mostrar senha). */
function Campo(props: {
  id: string;
  rotulo: string;
  tipo: string;
  autoComplete: string;
  valor: string;
  aoMudar: (v: string) => void;
  erro?: string;
  dica?: string;
  icone: React.ReactNode;
  acao?: React.ReactNode;
}) {
  const idMensagem = `${props.id}-msg`;
  return (
    <div>
      <label htmlFor={props.id} className="mb-1.5 block text-sm text-white/70">
        {props.rotulo}
      </label>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border bg-fundo px-3 py-2.5 focus-within:border-violeta",
          props.erro ? "border-red-400/60" : "border-linha",
        )}
      >
        <span className="text-white/40">{props.icone}</span>
        <input
          id={props.id}
          type={props.tipo}
          autoComplete={props.autoComplete}
          value={props.valor}
          onChange={(e) => props.aoMudar(e.target.value)}
          aria-invalid={Boolean(props.erro)}
          aria-describedby={idMensagem}
          className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
        />
        {props.acao}
      </div>
      <p id={idMensagem} className={cn("mt-1 min-h-[1.25rem] text-xs", props.erro ? "text-red-300" : "text-white/40")}>
        {props.erro ?? props.dica ?? ""}
      </p>
    </div>
  );
}
