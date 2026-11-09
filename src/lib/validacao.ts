// Validação dos campos de login e cadastro, e tradução das mensagens de erro do Supabase (RF01).
// São funções puras (só recebem texto e devolvem texto), por isso dá para testar sem abrir o site.
// Atenção: isto melhora a experiência (avisa o erro na hora), mas quem de fato protege a conta
// é o Supabase Auth no servidor. Nunca confiar só na validação do navegador (RNF01).

/** Tamanho mínimo da senha aceito pelo OASYS. */
export const TAMANHO_MINIMO_SENHA = 8;

/** Confere se o texto parece um e-mail (algo@algo.algo). Não prova que o e-mail existe. */
export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Devolve a mensagem do primeiro problema do e-mail, ou null se estiver tudo certo. */
export function erroDoEmail(email: string): string | null {
  if (!email.trim()) return "Informe o seu e-mail.";
  if (!emailValido(email)) return "Esse e-mail não parece válido.";
  return null;
}

/** Senha: tamanho mínimo, pelo menos uma letra e um número (regra simples e fácil de explicar). */
export function erroDaSenha(senha: string): string | null {
  if (!senha) return "Informe a senha.";
  if (senha.length < TAMANHO_MINIMO_SENHA) return `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return "Use letras e números na senha.";
  return null;
}

/** Traduz as mensagens (em inglês) do Supabase Auth para o português, sem revelar detalhes demais. */
export function traduzirErroDeLogin(mensagem: string): string {
  const m = mensagem.toLowerCase();
  // Mensagem genérica de propósito: não diz se foi o e-mail ou a senha que errou (evita descobrir contas).
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme o seu e-mail antes de entrar. Veja a caixa de entrada.";
  if (m.includes("user already registered")) return "Já existe uma conta com esse e-mail. Tente entrar.";
  if (m.includes("password should be at least")) return `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Espere um pouco e tente de novo.";
  if (m.includes("network") || m.includes("failed to fetch")) return "Sem conexão com o servidor. Verifique a internet.";
  return "Não foi possível concluir agora. Tente novamente.";
}
