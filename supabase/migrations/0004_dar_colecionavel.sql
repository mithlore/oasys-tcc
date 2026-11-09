-- 0004: entrega de colecionável de forma atômica (RF16, RF17, RN14).
-- Usada pelas Edge Functions `checkin` e `girar-roleta`. Se o usuário já tem a arte,
-- soma 1 na quantidade (a "repetida", que depois pode ser trocada, RN18); senão cria.
-- Retorna true quando a arte é NOVA para o usuário.
-- Faz tudo em um único comando para duas requisições simultâneas não se atropelarem.
create function public.dar_colecionavel(p_usuario uuid, p_colecionavel uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  nova boolean;
begin
  insert into public.user_collection (user_id, collectible_id, quantity)
  values (p_usuario, p_colecionavel, 1)
  on conflict (user_id, collectible_id)
    do update set quantity = public.user_collection.quantity + 1
  returning (xmax = 0) into nova; -- xmax = 0 quando a linha foi inserida (e não atualizada)
  return nova;
end $$;

-- Função de servidor: só o service_role (Edge Functions) pode chamar, nunca o navegador (RNF02).
revoke execute on function public.dar_colecionavel(uuid, uuid) from public, anon, authenticated;
grant execute on function public.dar_colecionavel(uuid, uuid) to service_role;
