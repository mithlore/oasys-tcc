# OASYS

Plataforma web em português para catalogar e avaliar jogos digitais, com recomendação por afinidade,
interação social e gamificação (XP, elos, check-in diário, roleta de colecionáveis e trocas).
Trabalho de Conclusão de Curso (Sistemas de Informação, UNIALFA).

**Autores:** Kaique Cirqueira Wanderley, Matheus Schmith Siqueira e Vinicius Porto Augusto.

## Tecnologias

React (Vite) + TypeScript, Tailwind, TanStack Query, React Router, Supabase (Auth, PostgreSQL com RLS
e Edge Functions) e Vercel.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

## Testes

```bash
npm test          # regras puras: XP/nível, elos, datas em Brasília e afinidade
npm run test:rls  # segurança do banco: aplica a migração num Postgres local e tenta burlar as regras
npm run build     # verificação de tipos + build de produção
```

## Estrutura

- `src/lib/`: regras do negócio como funções puras (`xp.ts`, `elos.ts`, `datas.ts`, `afinidade.ts`).
- `supabase/migrations/`: tabelas, RLS, triggers e funções de servidor.
- `supabase/tests/`: teste de segurança das políticas RLS.
- `design/`: protótipo visual da tela inicial.
- `CLAUDE.md`: guia do projeto (regras, requisitos e decisões).

## Segurança

Nenhuma chave secreta é versionada. O navegador usa apenas a chave pública (anon); as regras são
garantidas pelo RLS e por funções de servidor.
