// Testes da validação de login e cadastro (RF01).
import { describe, expect, it } from "vitest";
import { emailValido, erroDaSenha, erroDoEmail, traduzirErroDeLogin } from "./validacao";

describe("e-mail", () => {
  it("aceita e-mails comuns e recusa os inválidos", () => {
    expect(emailValido("kaique@exemplo.com")).toBe(true);
    expect(emailValido("  kaique@exemplo.com  ")).toBe(true);
    expect(emailValido("kaique@exemplo")).toBe(false);
    expect(emailValido("kaique exemplo@x.com")).toBe(false);
    expect(emailValido("")).toBe(false);
  });
  it("devolve a mensagem certa", () => {
    expect(erroDoEmail("")).toMatch(/Informe/);
    expect(erroDoEmail("abc")).toMatch(/válido/);
    expect(erroDoEmail("a@b.co")).toBeNull();
  });
});

describe("senha", () => {
  it("exige 8 caracteres, letras e números", () => {
    expect(erroDaSenha("")).toMatch(/Informe/);
    expect(erroDaSenha("abc123")).toMatch(/8 caracteres/);
    expect(erroDaSenha("abcdefgh")).toMatch(/letras e números/);
    expect(erroDaSenha("12345678")).toMatch(/letras e números/);
    expect(erroDaSenha("abcd1234")).toBeNull();
  });
});

describe("tradução de erros do Supabase", () => {
  it("não revela se foi o e-mail ou a senha que errou", () => {
    expect(traduzirErroDeLogin("Invalid login credentials")).toBe("E-mail ou senha incorretos.");
  });
  it("traduz os casos conhecidos e tem um padrão para o resto", () => {
    expect(traduzirErroDeLogin("Email not confirmed")).toMatch(/Confirme/);
    expect(traduzirErroDeLogin("User already registered")).toMatch(/Já existe/);
    expect(traduzirErroDeLogin("algo inesperado")).toMatch(/Tente novamente/);
  });
});
