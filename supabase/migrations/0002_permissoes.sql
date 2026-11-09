-- Permissões explícitas das tabelas para a Data API do Supabase.
-- Com "Automatically expose new tables" DESLIGADO, nada é liberado por padrão: só o que está aqui.
-- Duas camadas protegem os dados: estes GRANTs (o que o papel pode tentar) e as políticas RLS
-- da migração 0001 (quais linhas pode acessar). O papel "anon" (visitante sem login) não recebe nada (RF01).

-- Servidor (Edge Functions com a chave de serviço): acesso total às tabelas.
grant usage on schema public to authenticated, service_role;
grant all on all tables in schema public to service_role;

-- Usuário logado: só o que cada tela precisa; as políticas RLS filtram as linhas.
grant select, update on public.profiles to authenticated;           -- xp/level/role protegidos por trigger (RN01, RN02)
grant select, insert, update, delete on public.games to authenticated;         -- escrita só admin (RLS)
grant select, insert, update, delete on public.collectibles to authenticated;  -- escrita só admin (RLS)
grant select, insert, update, delete on public.ratings to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert on public.game_views to authenticated;
grant select, insert, update, delete on public.behavior_profiles to authenticated;
grant select, insert, update, delete on public.friendships to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.comments to authenticated;
grant select, insert on public.direct_messages to authenticated;
grant select on public.user_collection to authenticated;  -- escrita só pelo servidor (RN14, RN19)
grant select on public.daily_logs to authenticated;       -- escrita só pelo servidor (RN03)
grant select on public.roulette_days to authenticated;    -- escrita só pelo servidor (RN04)
grant select on public.xp_events to authenticated;        -- escrita só pelo servidor (RN02)
grant select, insert, update on public.trades to authenticated; -- aceite só pela função aceitar_troca (RN19)
