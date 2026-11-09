-- 0005: nova fórmula de nível (RN20). O nível N começa em N·(N−1) XP; o nível 100 custa 9.900 XP.
-- Motivo: quem faz só o check-in todo dia (15 XP + 100 XP por semana completa) deve chegar
-- ao nível máximo em cerca de 1 ano. A fórmula anterior (5·N·(N−1), teto de 49.500 XP) era longa demais.
-- Inverso da fórmula: N = floor((1 + sqrt(1 + 4·XP)) / 2), limitado entre 1 e 100.
-- O XP total continua somando depois do nível 100 (serve para o ranking).

-- Recria a função de servidor que concede XP (continua só para o service_role, RN02).
create or replace function public.conceder_xp(p_usuario uuid, p_motivo text, p_quantidade integer)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  perfil public.profiles;
begin
  update public.profiles
     set xp = xp + p_quantidade,
         level = least(100, greatest(1, floor((1 + sqrt(1 + 4.0 * (xp + p_quantidade))) / 2)::integer))
   where id = p_usuario
  returning * into perfil;
  insert into public.xp_events (user_id, reason, amount) values (p_usuario, p_motivo, p_quantidade);
  return perfil;
end $$;

-- Recalcula o nível de quem já existe (a migração roda como dono do banco, então o gatilho
-- que protege xp e nível contra o navegador não bloqueia).
update public.profiles
   set level = least(100, greatest(1, floor((1 + sqrt(1 + 4.0 * xp)) / 2)::integer));

-- Garante que as permissões continuam as mesmas depois de recriar a função.
revoke execute on function public.conceder_xp(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.conceder_xp(uuid, text, integer) to service_role;
