-- Endurece as funções do banco (avisos do verificador de segurança do Supabase).

-- 1) Fixa o search_path das funções de gatilho: evita que um schema falso "sequestre" nomes de tabela.
alter function public.proteger_colunas_do_perfil() set search_path = public;
alter function public.trocas_so_mudam_situacao() set search_path = public;

-- 2) O gatilho de cadastro só precisa rodar pelo próprio banco: ninguém chama pela API.
revoke execute on function public.criar_perfil_no_cadastro() from public, anon, authenticated;

-- 3) As funções de papel são usadas pelas políticas RLS (executadas como o usuário logado):
--    o visitante sem login (anon) não precisa chamá-las (RF01).
revoke execute on function public.papel_atual(), public.eh_admin(), public.eh_equipe() from public, anon;
grant execute on function public.papel_atual(), public.eh_admin(), public.eh_equipe() to authenticated, service_role;

-- 4) rls_auto_enable() é criada pelo Supabase quando a opção "Enable automatic RLS" está ligada:
--    só o banco dispara; ninguém precisa chamar pela API. Só mexe se a função existir.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
