-- OASYS: modelo de dados inicial (CLAUDE.md, seção 8; TCC, Quadros 9 a 14).
-- REGRA: toda tabela tem RLS ligado (RNF01). O navegador só lê/escreve o que as políticas permitem;
-- tudo que concede benefício (XP, check-in, giros, coleção, troca) passa por função no servidor (RN02, RNF02).

-- ============================================================
-- Tipos
-- ============================================================
create type public.papel as enum ('usuario', 'suporte', 'admin');            -- RF21
create type public.raridade as enum ('comum', 'rara', 'epica', 'lendaria');   -- RF17
create type public.situacao_amizade as enum ('pendente', 'aceita', 'recusada'); -- RN09
create type public.situacao_troca as enum ('pendente', 'aceita', 'recusada', 'cancelada'); -- RF22

-- ============================================================
-- Tabelas
-- ============================================================

-- Perfil público do usuário. Criado por trigger no cadastro; o e-mail fica só em auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  avatar_url text,
  bio text,
  role public.papel not null default 'usuario',      -- só o admin altera (RN01)
  xp integer not null default 0 check (xp >= 0),     -- só o servidor altera (RN02)
  level integer not null default 1 check (level between 1 and 100), -- derivado do XP (RN20)
  archetype text,                                    -- resultado do questionário (RF14)
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'Perfil público do usuário (RF09). role protegido por RN01; xp/level só pelo servidor (RN02).';

-- Catálogo de jogos, cadastrado pelo administrador (RF18). Guarda só URLs de imagens (RN12).
create table public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  synopsis text,
  genre text,
  developer text,
  cover_url text,
  backdrop_url text,
  screenshots text[] not null default '{}',
  trailer_url text,
  playtime_hours numeric,
  purchase_links jsonb not null default '[]',
  play_style text,    -- os 4 atributos usados na afinidade (seção 4.4)
  pace text,
  difficulty text,
  world_type text,
  release_year integer,
  steam_app_id integer unique,
  created_at timestamptz not null default now()
);
comment on table public.games is 'Catálogo de jogos (RF02, RF03, RF18). Imagens só por URL (RN12).';

-- Avaliação do usuário para um jogo: no máximo uma por jogo (RN05).
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  score numeric(3, 1) not null check (score between 0 and 10),
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, game_id)
);
comment on table public.ratings is 'Avaliações (RF04). unique(user_id, game_id) garante RN05.';

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);
comment on table public.favorites is 'Jogos favoritos (RF05).';

create table public.game_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index game_views_user_idx on public.game_views (user_id, created_at desc);
comment on table public.game_views is 'Histórico de visualizações (RF06), insumo da afinidade (RN06).';

create table public.behavior_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  answers jsonb not null default '{}',
  archetype_points jsonb not null default '{}'
);
comment on table public.behavior_profiles is 'Respostas do questionário "Me Descobrir" (RF14, RN13).';

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status public.situacao_amizade not null default 'pendente',
  created_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);
-- Impede o par repetido em qualquer direção.
create unique index friendships_par_unico on public.friendships (
  least(requester_id, addressee_id), greatest(requester_id, addressee_id)
);
comment on table public.friendships is 'Amizades (RF10). Só vale após aceite do destinatário (RN09).';

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  text text not null check (length(text) between 1 and 2000),
  created_at timestamptz not null default now()
);
comment on table public.posts is 'Publicações do feed (RF11).';

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  rating_id uuid references public.ratings (id) on delete cascade,
  text text not null check (length(text) between 1 and 1000),
  created_at timestamptz not null default now(),
  check (num_nonnulls(post_id, rating_id) = 1) -- comenta uma publicação OU uma avaliação (RF12)
);
comment on table public.comments is 'Comentários em publicações ou avaliações (RF12).';

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  text text not null check (length(text) between 1 and 2000),
  created_at timestamptz not null default now(),
  check (sender_id <> receiver_id)
);
create index direct_messages_par_idx on public.direct_messages (sender_id, receiver_id, created_at);
comment on table public.direct_messages is 'Mensagens diretas (RF13). Só os participantes leem (RN10).';

-- Artes colecionáveis sorteadas pela roleta (RF17).
create table public.collectibles (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games (id) on delete set null,
  title text not null,
  image_url text,
  rarity public.raridade not null,
  description text
);
comment on table public.collectibles is 'Colecionáveis da roleta (RF17).';

create table public.user_collection (
  user_id uuid not null references public.profiles (id) on delete cascade,
  collectible_id uuid not null references public.collectibles (id) on delete cascade,
  quantity integer not null default 1 check (quantity >= 1),
  acquired_at timestamptz not null default now(),
  primary key (user_id, collectible_id)
);
comment on table public.user_collection is 'Coleção do usuário. Escrita só pelo servidor (RN14, RN19).';

-- Check-in: um por usuário por dia de Brasília (RN03). week_start é o DOMINGO da semana.
create table public.daily_logs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  week_start date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);
comment on table public.daily_logs is 'Check-ins diários (RF16, RN03). Semana de domingo a sábado.';

-- Giros da roleta: o "dia de giro" vai de 21h a 21h, horário de Brasília (RN04).
create table public.roulette_days (
  user_id uuid not null references public.profiles (id) on delete cascade,
  spin_day date not null,
  spins_used integer not null default 0 check (spins_used between 0 and 3),
  primary key (user_id, spin_day)
);
comment on table public.roulette_days is 'Giros usados por período de 21h a 21h (RF17, RN04). O check limita a 3.';

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  amount integer not null,
  created_at timestamptz not null default now()
);
create index xp_events_user_idx on public.xp_events (user_id, created_at desc);
comment on table public.xp_events is 'Registro auditável de cada XP concedido (RF15, RN02).';

create table public.trades (
  id uuid primary key default gen_random_uuid(),
  proposer_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  offered_collectible_id uuid not null references public.collectibles (id),
  requested_collectible_id uuid not null references public.collectibles (id),
  status public.situacao_troca not null default 'pendente',
  created_at timestamptz not null default now(),
  check (proposer_id <> receiver_id)
);
comment on table public.trades is 'Trocas de colecionáveis repetidos (RF22, RN18, RN19). Aceite só pela função aceitar_troca.';

-- ============================================================
-- Funções auxiliares de papel (security definer evita recursão do RLS em profiles)
-- ============================================================
create function public.papel_atual() returns public.papel
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create function public.eh_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.papel_atual() = 'admin', false)
$$;

create function public.eh_equipe() returns boolean -- suporte ou admin (RF20)
language sql stable security definer set search_path = public as $$
  select coalesce(public.papel_atual() in ('suporte', 'admin'), false)
$$;

-- ============================================================
-- Triggers
-- ============================================================

-- Cria o perfil quando alguém se cadastra no Supabase Auth.
create function public.criar_perfil_no_cadastro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    split_part(coalesce(new.email, 'jogador'), '@', 1) || '_' || substr(replace(new.id::text, '-', ''), 1, 4)
  );
  return new;
end $$;

create trigger ao_criar_usuario after insert on auth.users
for each row execute function public.criar_perfil_no_cadastro();

-- Protege colunas sensíveis do perfil contra edição direta pelo navegador (RN01, RN02).
-- Só vale para quem chega pelo navegador (papéis authenticated/anon); o servidor (service_role) passa.
create function public.proteger_colunas_do_perfil() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.xp is distinct from old.xp or new.level is distinct from old.level then
      raise exception 'XP e nível só podem ser alterados pelo servidor (RN02)';
    end if;
    if new.role is distinct from old.role and not public.eh_admin() then
      raise exception 'Somente o administrador altera papéis (RN01)';
    end if;
  end if;
  return new;
end $$;

create trigger proteger_perfil before update on public.profiles
for each row execute function public.proteger_colunas_do_perfil();

-- Uma troca já criada só pode mudar de situação pelo navegador (nunca os itens ou as pessoas).
create function public.trocas_so_mudam_situacao() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    if (new.proposer_id, new.receiver_id, new.offered_collectible_id, new.requested_collectible_id)
       is distinct from
       (old.proposer_id, old.receiver_id, old.offered_collectible_id, old.requested_collectible_id) then
      raise exception 'Uma troca criada só pode mudar de situação (RN18)';
    end if;
  end if;
  return new;
end $$;

create trigger trocas_protegidas before update on public.trades
for each row execute function public.trocas_so_mudam_situacao();

-- ============================================================
-- Funções de servidor (só o service_role executa: chamadas pelas Edge Functions)
-- ============================================================

-- Concede XP e recalcula o nível: o nível N começa em 5·N·(N−1) XP, máximo 100 (RN20).
create function public.conceder_xp(p_usuario uuid, p_motivo text, p_quantidade integer)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  perfil public.profiles;
begin
  update public.profiles
     set xp = xp + p_quantidade,
         level = least(100, greatest(1, floor((1 + sqrt(1 + 4.0 * (xp + p_quantidade) / 5.0)) / 2)::integer))
   where id = p_usuario
  returning * into perfil;
  insert into public.xp_events (user_id, reason, amount) values (p_usuario, p_motivo, p_quantidade);
  return perfil;
end $$;

-- Gasta um giro da roleta numa ÚNICA operação condicional atômica (RN04, RNF05).
-- Retorna o total de giros usados, ou NULL se o limite de 3 já foi atingido.
create function public.gastar_giro(p_usuario uuid, p_dia_de_giro date)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  usados integer;
begin
  insert into public.roulette_days (user_id, spin_day, spins_used)
  values (p_usuario, p_dia_de_giro, 0)
  on conflict (user_id, spin_day) do nothing;

  update public.roulette_days
     set spins_used = spins_used + 1
   where user_id = p_usuario and spin_day = p_dia_de_giro and spins_used < 3
  returning spins_used into usados;

  return usados;
end $$;

-- Efetiva a troca de colecionáveis em uma única transação: ou transfere os dois, ou nenhum (RN19).
-- Só vale para cópias repetidas (quantidade >= 2) e só para o destinatário da proposta (RN18).
create function public.aceitar_troca(p_troca uuid, p_destinatario uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  t public.trades;
  qtd_proponente integer;
  qtd_destinatario integer;
begin
  select * into t from public.trades where id = p_troca for update;
  if not found or t.status <> 'pendente' then
    raise exception 'Troca indisponível';
  end if;
  if t.receiver_id <> p_destinatario then
    raise exception 'Somente o destinatário pode aceitar a troca';
  end if;

  select quantity into qtd_proponente from public.user_collection
   where user_id = t.proposer_id and collectible_id = t.offered_collectible_id for update;
  select quantity into qtd_destinatario from public.user_collection
   where user_id = t.receiver_id and collectible_id = t.requested_collectible_id for update;
  if coalesce(qtd_proponente, 0) < 2 or coalesce(qtd_destinatario, 0) < 2 then
    raise exception 'Só é possível trocar cópias repetidas (RN18)';
  end if;

  -- cada lado perde uma cópia e ganha uma do outro item
  update public.user_collection set quantity = quantity - 1
   where user_id = t.proposer_id and collectible_id = t.offered_collectible_id;
  update public.user_collection set quantity = quantity - 1
   where user_id = t.receiver_id and collectible_id = t.requested_collectible_id;

  insert into public.user_collection (user_id, collectible_id, quantity)
  values (t.receiver_id, t.offered_collectible_id, 1)
  on conflict (user_id, collectible_id) do update set quantity = public.user_collection.quantity + 1;
  insert into public.user_collection (user_id, collectible_id, quantity)
  values (t.proposer_id, t.requested_collectible_id, 1)
  on conflict (user_id, collectible_id) do update set quantity = public.user_collection.quantity + 1;

  update public.trades set status = 'aceita' where id = t.id;
end $$;

-- Funções de servidor: ninguém do navegador pode chamar.
revoke all on function public.conceder_xp(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.gastar_giro(uuid, date) from public, anon, authenticated;
revoke all on function public.aceitar_troca(uuid, uuid) from public, anon, authenticated;
grant execute on function public.conceder_xp(uuid, text, integer) to service_role;
grant execute on function public.gastar_giro(uuid, date) to service_role;
grant execute on function public.aceitar_troca(uuid, uuid) to service_role;

-- ============================================================
-- RLS: ligado em 100% das tabelas (RNF01)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.ratings enable row level security;
alter table public.favorites enable row level security;
alter table public.game_views enable row level security;
alter table public.behavior_profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.direct_messages enable row level security;
alter table public.collectibles enable row level security;
alter table public.user_collection enable row level security;
alter table public.daily_logs enable row level security;
alter table public.roulette_days enable row level security;
alter table public.xp_events enable row level security;
alter table public.trades enable row level security;

-- profiles: perfis são públicos para quem está logado; cada um edita o seu; admin edita qualquer um.
create policy perfis_leitura on public.profiles for select to authenticated using (true);
create policy perfis_edicao_propria on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy perfis_edicao_admin on public.profiles for update to authenticated
  using (public.eh_admin()) with check (public.eh_admin());

-- games e collectibles: todos leem; só o admin escreve.
create policy jogos_leitura on public.games for select to authenticated using (true);
create policy jogos_escrita_admin on public.games for all to authenticated
  using (public.eh_admin()) with check (public.eh_admin());
create policy colecionaveis_leitura on public.collectibles for select to authenticated using (true);
create policy colecionaveis_escrita_admin on public.collectibles for all to authenticated
  using (public.eh_admin()) with check (public.eh_admin());

-- ratings: todos leem; cada um cria/edita as suas; apagar: o autor ou a equipe (RN11, RF20).
create policy avaliacoes_leitura on public.ratings for select to authenticated using (true);
create policy avaliacoes_criar on public.ratings for insert to authenticated with check (user_id = auth.uid());
create policy avaliacoes_editar on public.ratings for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy avaliacoes_apagar on public.ratings for delete to authenticated
  using (user_id = auth.uid() or public.eh_equipe());

-- favorites, game_views, behavior_profiles: só o próprio usuário (RN06).
create policy favoritos_proprios on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy visualizacoes_leitura on public.game_views for select to authenticated using (user_id = auth.uid());
create policy visualizacoes_criar on public.game_views for insert to authenticated with check (user_id = auth.uid());
create policy comportamento_proprio on public.behavior_profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- friendships: as duas partes leem; o remetente cria como "pendente"; só o destinatário aceita/recusa (RN09).
create policy amizades_leitura on public.friendships for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy amizades_criar on public.friendships for insert to authenticated
  with check (requester_id = auth.uid() and status = 'pendente');
create policy amizades_responder on public.friendships for update to authenticated
  using (addressee_id = auth.uid() and status = 'pendente')
  with check (addressee_id = auth.uid() and status in ('aceita', 'recusada'));
create policy amizades_remover on public.friendships for delete to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- posts e comments: todos leem; cada um cria/edita os seus; apagar: o autor ou a equipe (RN11).
create policy publicacoes_leitura on public.posts for select to authenticated using (true);
create policy publicacoes_criar on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy publicacoes_editar on public.posts for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy publicacoes_apagar on public.posts for delete to authenticated
  using (author_id = auth.uid() or public.eh_equipe());
create policy comentarios_leitura on public.comments for select to authenticated using (true);
create policy comentarios_criar on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy comentarios_editar on public.comments for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy comentarios_apagar on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.eh_equipe());

-- direct_messages: só remetente e destinatário leem (RN10); só se envia como si mesmo.
create policy mensagens_leitura on public.direct_messages for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy mensagens_enviar on public.direct_messages for insert to authenticated
  with check (sender_id = auth.uid());

-- user_collection, daily_logs, roulette_days, xp_events: o usuário só LÊ o que é dele.
-- Sem política de escrita: nenhuma chamada do navegador concede benefício (RNF02).
create policy colecao_leitura on public.user_collection for select to authenticated using (user_id = auth.uid());
create policy checkins_leitura on public.daily_logs for select to authenticated using (user_id = auth.uid());
create policy giros_leitura on public.roulette_days for select to authenticated using (user_id = auth.uid());
create policy xp_leitura on public.xp_events for select to authenticated using (user_id = auth.uid());

-- trades: as duas partes leem; propõe quem tem a cópia repetida (RN18); recusa o destinatário, cancela o proponente.
-- O ACEITE não tem política: só a função aceitar_troca (service_role) efetiva (RN19).
create policy trocas_leitura on public.trades for select to authenticated
  using (proposer_id = auth.uid() or receiver_id = auth.uid());
create policy trocas_propor on public.trades for insert to authenticated
  with check (
    proposer_id = auth.uid()
    and status = 'pendente'
    and exists (
      select 1 from public.user_collection uc
       where uc.user_id = auth.uid() and uc.collectible_id = offered_collectible_id and uc.quantity >= 2
    )
  );
create policy trocas_recusar on public.trades for update to authenticated
  using (receiver_id = auth.uid() and status = 'pendente')
  with check (receiver_id = auth.uid() and status = 'recusada');
create policy trocas_cancelar on public.trades for update to authenticated
  using (proposer_id = auth.uid() and status = 'pendente')
  with check (proposer_id = auth.uid() and status = 'cancelada');
