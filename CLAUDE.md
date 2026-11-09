# OASYS – Guia do projeto para o Claude Code

> **Como usar este arquivo:** coloque-o na **pasta raiz do projeto** com o nome `CLAUDE.md`.
> O Claude Code (no terminal ou na extensão do VS Code) lê este arquivo automaticamente em toda sessão.
> Tudo aqui vem do TCC I (OASYS_TCC1_Revisado). Se o TCC mudar, atualize este arquivo também.

---

## 1. O que é o projeto

**OASYS** é uma plataforma web em português para **catalogar e avaliar jogos digitais**, com **recomendação por afinidade**, **interação social** entre jogadores e **gamificação** (XP, níveis, arquétipos, check-in diário e roleta de colecionáveis).

É um TCC de Sistemas de Informação (UNIALFA). Autores: Kaique Cirqueira Wanderley, Matheus Schmith Siqueira e Vinicius Porto Augusto.

**Contexto importante:** a versão anterior foi feita em uma plataforma no-code e foi **recusada pelo professor**. Este projeto é **escrito do zero, em código-fonte, pelos autores**, com o Claude como assistente. Por isso:

- Nada de geradores de app, templates prontos de "app inteiro" ou plataformas no-code.
- Os autores precisam **entender e explicar cada linha** na defesa. Por isso, **clareza vale mais que esperteza**.
- **Não importar usuários, avaliações nem dados sociais antigos.** Só o catálogo de jogos e artes é reaproveitado (seção 9).

---

## 2. Stack (não trocar sem os autores pedirem)

| Camada | Tecnologia |
|---|---|
| Editor e versionamento | VS Code + Git (commits pequenos e descritivos, em português) |
| Linguagens | **JavaScript/TypeScript** (interface e funções de servidor) e **SQL/PostgreSQL** (banco, RLS e regras) |
| Interface | React (Vite), Tailwind CSS, shadcn/ui, framer-motion |
| Dados no cliente | TanStack Query, react-router-dom, `@supabase/supabase-js` |
| Servidor | Supabase Edge Functions (Deno/TypeScript) |
| Banco | PostgreSQL no Supabase, **RLS habilitado em 100% das tabelas** |
| Autenticação | Supabase Auth (e-mail e senha) |
| Hospedagem | Vercel (deploy pelo GitHub) |
| Fontes externas | API pública da Steam (`appdetails`), API do SteamGridDB, site HowLongToBeat (**consulta manual**, sem API) |

**Não usar:** PHP, IA dentro da plataforma (nenhuma API de LLM), upload de imagens de jogos e bibliotecas de recomendação ou machine learning.

---

## 3. REGRA Nº 1: comentar todo o código em português

Todo código criado ou alterado **deve vir comentado em português do Brasil**, para os autores explicarem na banca.

1. **Cabeçalho em cada arquivo:** o que o arquivo faz, onde é usado e quais requisitos atende (ex.: `// Atende RF16 e RN03`).
2. **Comentário em cada bloco lógico** (componente, função, hook, consulta, `if`, laço): *o que* faz e *por que* foi feito assim.
3. **Comentário de linha** em tudo que não é óbvio: cálculos, filtros, datas e fuso, chamadas ao Supabase.
4. **SQL:** comentar cada tabela, coluna importante, índice, trigger e **cada política RLS** (`-- quem pode ler/escrever e por quê`).
5. **Edge Functions:** comentar as etapas, que são 1) autenticar, 2) validar a entrada, 3) aplicar a regra de negócio, 4) gravar e 5) responder.
6. Linguagem simples, como se explicasse para um professor da banca. Termo técnico vem com explicação.

Exemplo do nível esperado:

```ts
// Conta quantos giros o usuário já fez hoje (RN04: limite de 3 por dia).
// Roda no servidor para o usuário não conseguir burlar o limite pelo navegador (RNF02).
const { count } = await supabase
  .from("roulette_spins")                        // tabela que registra cada giro
  .select("*", { count: "exact", head: true })   // pede só a contagem, sem trazer as linhas
  .eq("user_id", userId)                         // apenas os giros deste usuário
  .eq("day", hojeEmBrasilia);                    // "dia" calculado no fuso America/Sao_Paulo (RN03)
```

**Ao terminar cada tarefa**, o Claude deve explicar em poucas linhas o que fez, quais arquivos mudaram e quais requisitos (RF/RN) foram atendidos.

---

## 4. Atores e papéis

- **Visitante:** não tem acesso a nada. **Todo conteúdo exige login** (RF01).
- **Usuário:** avalia, favorita, interage, participa da gamificação.
- **Suporte:** tudo do usuário + moderação (remover publicações, comentários e avaliações de terceiros).
- **Administrador:** tudo do suporte + catálogo de jogos, papéis de acesso e configurações.

O papel fica em `profiles.role` (`'usuario' | 'suporte' | 'admin'`). **Só o admin altera papéis (RN01)**, e isso tem que ser garantido no banco (RLS + trigger), não só na tela.

---

## 5. Requisitos funcionais (RF)

| ID | Requisito |
|---|---|
| RF01 | Cadastro e login; login obrigatório para qualquer conteúdo |
| RF02 | Listar, buscar e filtrar jogos |
| RF03 | Página do jogo: sinopse, gênero, desenvolvedora, imagens, tempo de jogo, links de compra |
| RF04 | Avaliar jogo com nota e comentário |
| RF05 | Favoritar / desfavoritar |
| RF06 | Registrar visualizações de jogos |
| RF07 | Calcular afinidade usuário × jogo e exibir recomendações ordenadas |
| RF08 | Seções gerais quando o usuário não tem histórico |
| RF09 | Perfil público: informações, avaliações, nível, arquétipo, colecionáveis |
| RF10 | Amizades: enviar, aceitar, recusar, remover |
| RF11 | Feed comunitário |
| RF12 | Comentários em publicações e em avaliações |
| RF13 | Mensagens diretas |
| RF14 | Questionário "Me Descobrir" → arquétipo |
| RF15 | XP por ações e cálculo de nível |
| RF16 | Check-in diário com recompensa |
| RF17 | Roleta de colecionáveis (Santuário): raridades, limite diário, coleção |
| RF18 | Admin: cadastrar/editar/remover jogos, com preenchimento automático pela API da Steam |
| RF19 | Obter capas, imagens e tempos de jogo das fontes externas |
| RF20 | Moderar conteúdo (suporte e admin) |
| RF21 | Admin gerencia papéis de acesso |
| RF22 | Troca de colecionáveis repetidos entre usuários (Mercado de Trocas) |
| RF23 | Ranking da comunidade (jogos em alta, por avaliações e comentários) |
| RF24 | Progressão por elos: o elo vem do nível e define a borda do avatar |

## 6. Regras de negócio (RN): o banco e o servidor têm que garantir

| ID | Regra |
|---|---|
| RN01 | Só admin altera papel; usuário não muda o próprio papel nem o de outro |
| RN02 | XP só é concedido por **Edge Function**; o cliente apenas solicita |
| RN03 | Check-in 1 vez por dia; "dia" calculado no fuso **America/Sao_Paulo**. Ao completar **7 check-ins na mesma semana (domingo a sábado)**, concede **+100 XP** e uma arte aleatória rara ou épica, uma vez por semana; completar **todos os dias do mês** concede uma arte lendária |
| RN04 | Roleta: **3 giros por dia**, à prova de requisições simultâneas; os giros reiniciam às **21h (Brasília)** |
| RN05 | Uma avaliação por usuário por jogo (editável) → `unique(user_id, game_id)` |
| RN06 | Afinidade usa **só o histórico do próprio usuário** + atributos do jogo |
| RN07 | Sem histórico → seções gerais, sem pontuação |
| RN08 | Recomendação por **regras e pontuação**, sem IA/ML |
| RN09 | Amizade só vale após aceite do destinatário |
| RN10 | Mensagem direta só é lida pelos participantes |
| RN11 | Usuário edita/exclui só o próprio conteúdo; terceiros → suporte/admin |
| RN12 | Dados e imagens vêm de fontes externas; **banco guarda só a URL das imagens** |
| RN13 | Arquétipo: cada resposta soma 1 ponto a um arquétipo; vence o maior; empate → primeiro na ordem fixa |
| RN14 | Sorteio da roleta considera raridade e é decidido **no servidor** |
| RN15 | Afinidade: nota abaixo da média do usuário reduz o score; acima aumenta; scores normalizados |
| RN16 | Diversificação: no máximo **3 dos 10 primeiros** com o mesmo estilo de jogo |
| RN17 | Empate de afinidade → ordem alfabética do título |
| RN18 | Troca: só entre colecionáveis repetidos (quantidade ≥ 2), só com aceite do destinatário e executada de forma atômica no servidor (função `aceitar-troca`) |
| RN19 | Troca sem valor monetário; cada usuário só propõe itens que possui |
| RN20 | Nível = maior N tal que N·(N−1) ≤ XP (máx. 100, com 9.900 XP; o XP total continua somando para o ranking). Elo = `floor((nível − 1) / 10)`, em 10 elos de 10 níveis |
| RN21 | Elo e borda do avatar são calculados a partir do nível (no servidor/em `src/lib/elos.ts`), nunca gravados pelo cliente |

## 7. Requisitos não funcionais (RNF): critérios de aceite

- **RNF01 Segurança:** RLS em 100% das tabelas; nenhuma ação restrita funciona com conta comum.
- **RNF02:** benefícios (XP, check-in, giros) só pelo servidor; chamada direta às tabelas não concede nada.
- **RNF03 Usabilidade:** heurísticas de Nielsen; meta SUS ≥ 68 e ≥ 80% das tarefas concluídas sem ajuda.
- **RNF04 Responsividade:** sem rolagem horizontal nem corte em 1920, 1366, 768 e 360 px.
- **RNF05 Confiabilidade:** fuso único; 10 giros simultâneos não ultrapassam o limite.
- **RNF06 Explicabilidade:** toda recomendação mostra os atributos/interações que geraram a nota.
- **RNF07 Privacidade (LGPD):** coletar só o necessário; contas de teste excluídas após a análise.
- **RNF08 Manutenibilidade:** tabelas, RLS e funções documentadas e versionadas (migrations no Git).
- **RNF09 Desempenho:** página inicial utilizável em até 3 s (10 Mbps, cache vazio, mediana de 5 medições).

---

## 8. Modelo de dados (sugestão de tabelas)

Os nomes no TCC são conceituais. Abaixo está a sugestão em `snake_case`. **Toda tabela: RLS ligado + comentário em SQL.**

| Tabela | Campos principais | Observações |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `username`, `avatar_url`, `bio`, `role`, `xp`, `level`, `archetype` | criada por trigger no cadastro; `role` protegido (RN01) |
| `games` | `title`, `synopsis`, `genre`, `developer`, `cover_url`, `backdrop_url`, `screenshots` (text[]), `trailer_url`, `playtime_hours`, `purchase_links` (jsonb), `play_style`, `pace`, `difficulty`, `world_type`, `release_year`, `steam_app_id` | os 4 atributos em negrito no cálculo: **play_style, pace, difficulty, world_type** |
| `ratings` | `user_id`, `game_id`, `score`, `comment`, `created_at` | `unique(user_id, game_id)` (RN05) |
| `favorites` | `user_id`, `game_id`, `created_at` | `unique(user_id, game_id)` |
| `game_views` | `user_id`, `game_id`, `created_at` | histórico de visualizações (RF06) |
| `behavior_profiles` | `user_id`, `answers` (jsonb), `archetype_points` (jsonb) | resultado do questionário |
| `friendships` | `requester_id`, `addressee_id`, `status` (`pendente/aceita/recusada`) | RN09 |
| `posts` | `author_id`, `text`, `created_at` | feed |
| `comments` | `author_id`, `post_id` **ou** `rating_id`, `text` | `check` garantindo exatamente um dos dois |
| `direct_messages` | `sender_id`, `receiver_id`, `text`, `created_at` | RLS: só remetente/destinatário leem (RN10) |
| `collectibles` | `game_id`, `title`, `image_url`, `rarity` (`comum/rara/epica/lendaria`), `description` | artes da roleta |
| `user_collection` | `user_id`, `collectible_id`, `quantity`, `acquired_at` | coleção do usuário |
| `daily_logs` | `user_id`, `day` (date), `week_start` (date, domingo) | chave `(user_id, day)` → base de RN03 (check-in) |
| `roulette_days` | `user_id`, `spin_day` (date), `spins_used` (0 a 3) | o "dia de giro" vai de 21h a 21h (RN04); por isso é separado de `daily_logs` |
| `trades` | `proposer_id`, `receiver_id`, `offered_collectible_id`, `requested_collectible_id`, `status` (`pendente/aceita/recusada/cancelada`), `created_at` | RF22, RN18, RN19; RLS: só os dois participantes leem; aceite só pela função `aceitar-troca` |
| `xp_events` | `user_id`, `reason`, `amount`, `created_at` | registro auditável de cada XP concedido |

**Concorrência da roleta (RN04/RNF05):** fazer o "gasto" do giro com **uma única operação condicional atômica** em uma função SQL chamada pela Edge Function, por exemplo:
`update roulette_days set spins_used = spins_used + 1 where user_id = $1 and spin_day = $2 and spins_used < 3 returning spins_used;` (já implementado na função SQL `gastar_giro`)
Se não retornar linha, o limite foi atingido e o giro é recusado. Essa é a "operação condicional" citada no TCC (seção 4.5.3).

**Fórmula de nível e elos (definidas):** o nível N começa em `N·(N−1)` XP (máx. nível 100 = 9.900 XP; só check-in todo dia chega lá em cerca de 11 meses); elo = `floor((nível − 1) / 10)` (RN20). Check-in: +15 XP, +100 XP no 7º check-in da semana (domingo a sábado). **Os demais valores de XP** (avaliar, comentar, etc.) ainda não estão definidos: perguntar aos autores e deixar tudo em um único lugar (constante ou tabela de configuração), comentado.

---

## 9. Catálogo inicial (reaproveitado do export antigo)

- Arquivos: `Game.json` (129 jogos) e `GameArt.json` (516 artes → `collectibles`).
- **Não versionar o export no Git**, porque ele contém e-mails de usuários. Descartar `UserCollection.json` e todos os dados de usuários.
- Fazer um **script de seed** comentado (`scripts/seed-catalogo.ts` ou SQL) que lê os JSON e insere em `games` e `collectibles`, mapeando os campos para os nomes novos.
- **Corrigir antes de importar** (42 URLs problemáticas):
  - 9 imagens hospedadas em `base44.app` / `media.base44.com`, que **vão sair do ar**. Baixar e substituir por outra URL pública (ex.: Steam/SteamGridDB). Jogos: Naruto Storm 4, Mortal Kombat 1, Super Mario Odyssey, Bloodborne, The Last of Us Part II, Zelda BotW, Red Dead Redemption 2 (3 campos).
  - 32 miniaturas de buscador (`encrypted-tbn0.gstatic.com`, `imgs.search.brave.com`), que são temporárias e de baixa resolução. Trocar pelo link original.
  - 1 URL quebrada em Rainbow Six Siege (começa com `imgs.shttps:`).
- O seed deve **listar no console** qualquer URL que não seja `https://` válida.

---

## 10. Recomendação por afinidade (seção 4.4 do TCC: seguir à risca)

Atributos usados: **A = {play_style, pace, difficulty, world_type}**.

1. **Peso de cada interação `w(i)`:**
   - avaliação: `α · (nota − média das notas do próprio usuário)`, então nota abaixo da média vira peso negativo (RN15)
   - favorito: `β`
   - visualização: `γ`
   - Pesos iniciais: **α = 1, β = 2, γ = 0,5** (deixar como constantes nomeadas e comentadas)
2. **Score bruto** de um valor `x` do atributo `a`: soma dos pesos das interações com jogos que têm `a = x`.
3. **Normalização:** `ŝ = s(x) / Σ |s(x')|` sobre todos os valores do mesmo atributo. Se o denominador for 0, então `ŝ = 0`.
4. **Afinidade do jogo:** `f(u, j) = Σ ŝ(u, a, valor de j em a)` para cada atributo.
5. **Ordenação:** maior → menor; empate → título A-Z (RN17).
6. **Diversificação (RN16):** nos 10 primeiros, no máximo 3 com o mesmo `play_style`.
7. **Sem histórico (RN07):** mostrar seções gerais, sem pontuação.
8. **Explicabilidade (RNF06):** guardar, para cada jogo recomendado, quais atributos mais contribuíram, para exibir um "Recomendado porque…".
9. Só dados do **próprio usuário** (RN06). Roda **no cliente** (não concede benefício).
10. Criar também a **lista aleatória de mesmo tamanho**, usada como linha de base na avaliação do TCC.
11. Escrever o cálculo como **funções puras** em `src/lib/afinidade.ts`, com testes simples, para facilitar a explicação.

---

## 11. Integrações externas

- **Steam:** `https://store.steampowered.com/api/appdetails?appids=<ID>&l=portuguese` traz `short_description` (sinopse), `genres`, `developers` e imagens. Chamar **por uma Edge Function** (o navegador bloqueia por CORS). Não precisa de chave.
- **SteamGridDB:** precisa de chave de API. A chave fica **só como secret da Edge Function**, nunca no front nem no Git.
- **HowLongToBeat:** sem API oficial. O admin consulta o site e **digita** o tempo de jogo no formulário.
- **Imagens:** salvar apenas a URL (RN12). Na tela, usar `onError` para mostrar uma imagem padrão se o link quebrar.

---

## 12. Gamificação

- **Arquétipos (ordem fixa, usada no desempate):** 1) Estrategista Sombrio, 2) Explorador Incansável, 3) Guerreiro sem Medo, 4) Narrador de Histórias, 5) Construtor Meticuloso, 6) Caçador Social, 7) Colecionador Obsessivo, 8) Rebelde Caótico.
- Cada pergunta do "Me Descobrir" tem **exatamente uma opção por arquétipo**; cada resposta soma +1 (RN13). Os eixos de motivação aparecem só como "traços" na tela de resultado, sem mudar a atribuição. É um elemento **lúdico**, não um diagnóstico.
- **Check-in** (RF16/RN03): Edge Function; um por dia no fuso de Brasília; concede +15 XP; no 7º check-in da semana (domingo a sábado), +100 XP e uma arte rara ou épica sorteada entre as que o usuário ainda não tem; ao completar todos os dias do mês, uma arte lendária (também sorteada entre as que ele não tem). O app antigo usava semana ISO (segunda a domingo); **aqui a semana começa no domingo**. A semana é calculada pela data de domingo (`week_start`), **sem usar a semana ISO** (que começa na segunda).
- **Roleta / Santuário** (RF17/RN04/RN14): Edge Function; 3 giros por dia, reinício às 21h (Brasília); sorteio ponderado por raridade **no servidor**; grava em `user_collection`. Giro gratuito, sem dinheiro, item sem valor monetário.
- **XP** (RF15/RN02): sempre por Edge Function, registrando em `xp_events`. **Tabela de XP por ação (proposta aprovada pelos autores em 09/11/2026; os valores ficam em um único lugar no código):**

| Ação | XP | Regra |
|---|---|---|
| Avaliar um jogo | 10 | 1 vez por jogo |
| Favoritar um jogo | 5 | 1 vez por jogo |
| Abrir a página de um jogo | 1 | 1 vez por jogo |
| Publicar no feed | 5 | até 3 por dia |
| Comentar | 2 | até 5 por dia |
| Amizade aceita | 2 | até 5 por dia |
| Troca concluída | 5 | até 3 por dia |
| Questionário "Me Descobrir" | 20 | 1 vez |
| Check-in diário | 15 | 1 por dia |
| 7 check-ins na semana | 100 | 1 por semana |

  Metas de ritmo (para calibrar): só check-in todo dia chega ao nível 100 em cerca de 11 meses; ritmo normal, 6 a 8 meses; tudo no máximo todo dia, 3 a 4 meses. Ações "1 vez por jogo" são controladas pelo jogo (não pelo registro criado), para não dar pra apagar e refazer e ganhar de novo.

---

## 13. Telas (protótipo = as próprias telas do app)

| Tela | Elementos | Heurística principal |
|---|---|---|
| Início | carrosséis, recomendações, seções gerais | reconhecimento em vez de memorização |
| Catálogo e busca | busca, filtros, cartões | controle e liberdade |
| Página do jogo | capa, sinopse, tempo, links, nota, favorito | visibilidade do estado |
| Perfil | nível, arquétipo, avaliações, colecionáveis | consistência |
| Amigos e mensagens | lista, solicitações, conversas | prevenção de erros |
| Feed | publicações, comentários | correspondência com o mundo real |
| Questionário de arquétipo | perguntas, resultado | visibilidade do estado |
| Santuário | roleta, giros restantes, coleção | feedback imediato |
| Painel administrativo | jogos, URLs de imagens, moderação, papéis | eficiência e prevenção de erros |

Todas responsivas (RNF04). Mostrar estados de carregamento, vazio e erro.

---

## 13-B. HOME (tela de Início): protótipo aprovado pelos autores

**A home já está desenhada.** O arquivo `design/oasys-home-prototipo.html` é a **referência visual oficial**. Ele é HTML estático com dados de exemplo. Convertê-lo para React (`src/pages/Home.tsx` + componentes em `src/components/home/`), mantendo layout, cores, fontes e animações, e trocando os dados fictícios por consultas ao Supabase.

**Visual (manter):** fundo `#0c0e14`, violeta `#a78bfa` / `#6d28d9`, azul `#3b82f6`, dourado `#fde047` (raridade lendária). Fontes: Outfit (títulos), DM Sans (texto), Instrument Serif itálico (destaques), carregadas pelo Google Fonts. As variáveis CSS do `:root` do protótipo viram o tema do Tailwind.

**Seções (de cima para baixo) e de onde vem cada dado:**

| Seção do protótipo | Dados reais | Requisito |
|---|---|---|
| Topbar (Início, Catálogo, Santuário, Coleção, Amigos, Feed, Arquétipos, sino, perfil) | rotas do react-router; contagem de notificações | RF01 |
| Hero: "Descubra seu próximo jogo", nível/XP, botão de check-in | `profiles.xp/level`, `daily_logs`, Edge Function `checkin` | RF15, RF16, RN03 |
| Faixa rolante (marquee) | texto fixo | n/a |
| Continue sua jornada | últimos `game_views` do usuário | RF06 |
| Ranking da comunidade (trending) | avaliações e comentários recentes (consulta agregada, sem IA) | RF23, RF04, RF12 |
| Porque você viu X (recomendações) | `src/lib/afinidade.ts`; sem histórico, seções gerais | RF07, RF08, RN06, RN07, RNF06 |
| Santuário (giros restantes, repetidas) | `daily_logs.spins_used`, `user_collection`; giro só pela Edge Function | RF17, RN04, RN14 |
| Sua biblioteca | `favorites` | RF05 |
| Atividade dos amigos | `friendships` aceitas + `ratings`/`posts` deles | RF10, RF11, RN09 |
| Coleções temáticas | agrupamento por gênero/`play_style` | RF02 |
| Arquétipos | 8 arquétipos da seção 12 | RF14 |
| Progressão (Elos) | `profiles.level` → `src/lib/elos.ts` | RF15, RF24, RN20 |
| Spotlight e rodapé | jogo em destaque + links | n/a |

**Decisões dos autores (escopo oficial, já no TCC):**

1. **Elos:** 10 elos de 10 níveis, sem divisões. Cores do protótipo mantidas.

| Nível | Elo | Nível | Elo |
|---|---|---|---|
| 1–10 | Ferro | 51–60 | Rubi |
| 11–20 | Bronze | 61–70 | Diamante |
| 21–30 | Prata | 71–80 | Obsidiana |
| 31–40 | Ouro | 81–90 | Grão-Mestre |
| 41–50 | Platina | 91–100 | Lenda Absoluta |

   Nível pelo XP: o nível N começa em `N·(N−1)` XP (nível 100 = 9.900 XP). A borda do avatar muda de forma e de efeitos visuais conforme o nível (RN21); o TCC não fixa o desenho de cada borda, para permitir ajustes. Referência dos efeitos do app antigo: `src/components/profile/AvatarWithBorder.jsx` e `src/lib/xp.js` no repositório `mithlore/Oasys`. Implementar em `src/lib/elos.ts` (funções puras, com teste).
2. **Bônus de check-in:** +15 XP por check-in; **7 check-ins na mesma semana (domingo a sábado) = +100 XP + arte rara/épica**; **mês completo = arte lendária** (RN03). Só pela Edge Function `checkin`. Referência da lógica antiga: `base44/functions/dailyCheckin/entry.ts` no repositório `mithlore/Oasys`.
3. **Roleta:** 3 giros por dia, reinício às **21h (Brasília)** (RN04).
4. **Mercado de Trocas / trocar repetidas:** faz parte do escopo (RF22, RN18, RN19, tabela `trades`, função `aceitar-troca`). Implementar.
5. **Ranking da comunidade:** RF23, consulta agregada sem IA.

**Ainda a ajustar na conversão:**

1. **Nota "M 9.3"** nos cartões: usar a média dos `ratings`.
2. **Números fixos** ("132 jogos", "460 artes", "7 jogos salvos"): calcular com `count` no banco. O catálogo do export tem 129 jogos e 516 artes.
3. **Links `base44.app` e imagens hospedadas no Base44** (zelda, mario e outras): trocar por URLs públicas da Steam/SteamGridDB (seção 9) e por rotas internas do React.
4. **"Bem-vindo de volta":** a home só aparece logada (RF01).
5. **Elo, check-in e gráficos:** nada de benefício calculado no navegador ou em `localStorage` (RNF02). O protótipo mostra o elo de exemplo "Bronze, nível 19".
6. **Bordas por elo:** forma e efeitos livres para ajuste; manter a ideia do app antigo (efeitos mais ricos nos elos altos).

**Regra visual dos autores: NENHUM emoji no site.** Todos os ícones são **SVG próprios**, em componentes React em `src/components/icons/` (um arquivo por ícone ou um arquivo com todos), com traço simples e `currentColor` para herdar a cor do texto. Isso vale também para símbolos de texto como ★ e ✦ (o protótipo usa esses dois: trocar por ícones SVG na conversão). Os ícones de elo, raridade e arquétipo também são desenhados em SVG, sem emoji.

**Regras para converter a home:**
- Comentar em português conforme a Regra Nº 1; cada seção vira um componente pequeno.
- Estados de carregamento, vazio e erro em todas as seções (RNF04 e seção 13).
- Responsividade em 1920, 1366, 768 e 360 px; manter a barra de abas do celular (`mobileTabs`).
- Respeitar `prefers-reduced-motion` para as animações.
- Imagem quebrada: `onError` com imagem padrão (RN12).

---

## 14. Segurança (checklist obrigatório)

- [ ] RLS ligado em **todas** as tabelas, com políticas comentadas.
- [ ] Trigger/política impedindo usuário comum de alterar `role` (RN01).
- [ ] XP, check-in e roleta **só** por Edge Function (RN02 a RN04, RN14).
- [ ] No front, só a **chave pública (anon/publishable)** do Supabase. `service_role` e chaves de API **só** como secrets do servidor.
- [ ] `.env` no `.gitignore`. Criar um `.env.example` sem valores.
- [ ] Testar cada regra com uma **conta de usuário comum** tentando burlar.

---

## 15. Estrutura de pastas sugerida

```
oasys/
├─ CLAUDE.md                 ← este arquivo
├─ design/
│  └─ oasys-home-prototipo.html   ← referência visual da home (seção 13-B)
├─ .env.example              ← VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (sem valores)
├─ src/
│  ├─ pages/                 ← uma página por tela
│  ├─ components/            ← componentes reutilizáveis
│  ├─ lib/
│  │  ├─ supabase.ts         ← cliente do Supabase
│  │  ├─ afinidade.ts        ← cálculo da recomendação (funções puras)
│  │  └─ datas.ts            ← "hoje" no fuso America/Sao_Paulo
│  └─ hooks/                 ← consultas com TanStack Query
├─ supabase/
│  ├─ migrations/            ← SQL versionado: tabelas, RLS, triggers, funções
│  └─ functions/
│     ├─ checkin/            ← RF16
│     ├─ girar-roleta/       ← RF17 (usa a função SQL gastar_giro)
│     ├─ aceitar-troca/      ← RF22 (usa a função SQL aceitar_troca)
│     ├─ conceder-xp/        ← RF15
│     └─ importar-steam/     ← RF18/RF19
└─ scripts/
   └─ seed-catalogo.ts       ← importa jogos e artes (seção 9)
```

---

## 15-B. Estado atual do código (atualizar a cada etapa)

- **Feito:** base Vite+React+TS+Tailwind com tema e rotas provisórias; `src/lib/{xp,elos,datas,afinidade}.ts` com testes (`npm test`); migrações `0001_init.sql`, `0002_permissoes.sql` e `0003_endurecer_funcoes.sql` em `supabase/migrations/` (16 tabelas, RLS em todas, GRANTs explícitos, funções `conceder_xp`, `gastar_giro`, `aceitar_troca`), **já aplicadas** no projeto Supabase `Oasys` (região us-east-1; "Automatically expose new tables" desligado e "automatic RLS" ligado). Restam 3 avisos do verificador do Supabase sobre `eh_admin`, `eh_equipe` e `papel_atual` (executáveis por usuário logado): são intencionais, as políticas RLS dependem delas e elas só devolvem o papel de quem chama. Há também um teste de segurança do banco (`npm run test:rls`, 35 verificações).
- **Edge Functions publicadas** no Supabase (`supabase/functions/`): `checkin`, `girar-roleta` e `aceitar-troca`, com regras puras testadas em `_shared/regras.ts` (`npm test`) e a migração `0004_dar_colecionavel.sql` (entrega atômica de colecionável). Pesos da roleta (comum 60, rara 25, épica 10, lendária 5) herdados do app antigo: os autores podem ajustar em `PESO_POR_RARIDADE`. Ainda falta testar as funções de ponta a ponta com um usuário logado (depende do login).
- **Fórmula de nível nova (migração `0005_nova_formula_de_nivel.sql`, já aplicada):** N·(N−1), teto de 9.900 XP.
- **Pendente:** `conceder-xp` (XP por ações como avaliar e comentar), a implementar com a tabela de XP da seção 12.
- **Login e cadastro feitos (RF01):** `src/hooks/useAuth.tsx` (AuthProvider), `src/pages/Login.tsx`, `src/components/RotaProtegida.tsx` (todas as telas exigem login, só `/login` é aberta), `src/hooks/usePerfil.ts`, `src/lib/validacao.ts` (com testes) e ícones SVG em `src/components/icons/Icones.tsx`. O cabeçalho mostra elo, nível e nome. Falta testar o cadastro e o login reais com o Supabase (o ambiente do Claude não alcança o Supabase pelo navegador; testar no computador dos autores). No painel do Supabase, em Authentication, decidir se "Confirm email" fica ligado (em desenvolvimento é mais prático desligar).
- **Arte da tela de login feita:** `src/components/login/ArteLogin.tsx` (SVG próprio, sem emoji; aparece só a partir de `lg`; animação só de entrada).
- **Logo oficial:** `src/components/LogoOasys.tsx` (SVG vetorizado da logo dos autores: lua crescente, estrela e dunas, degradê lavanda a violeta). Usar sempre este componente, nunca uma lua desenhada à parte. Aparece no login e no cabeçalho.
- **Próximo:** home em React (a partir de `design/`), catálogo e o restante das telas; por fim o seed do catálogo (seção 9).
- **Antes de mexer no banco:** rodar `npm run test:rls`; ao criar tabela nova, ligar o RLS e acrescentar o caso ao teste.

---

## 16. Ordem de desenvolvimento (cronograma do TCC II)

**Meses 1–2: desenvolvimento**
1. Criar o projeto (Vite + React + Tailwind + shadcn/ui), conectar ao GitHub e à Vercel.
2. Supabase: migrations das tabelas + RLS + trigger de `profiles` + proteção do `role`.
3. Autenticação (cadastro, login, rota protegida).
4. Seed do catálogo (com as URLs corrigidas).
5. Catálogo, busca e página do jogo; avaliação, favorito e visualização.
6. Perfil, questionário de arquétipo.
7. Edge Functions: XP, check-in, roleta; tela do Santuário.
8. Social: amizades, feed, comentários, mensagens.
9. Painel administrativo (jogos + importação da Steam, moderação, papéis).
10. **Mês 2:** cálculo de afinidade + lista aleatória de base; revisão técnica e auditoria das RLS.

**Prioridade se faltar tempo:** catálogo → avaliação → recomendação → gamificação → social.

**Depois:** testes funcionais (mês 2–3), verificação da recomendação (mês 3), questionário (mês 3–4), teste de usabilidade com SUS (mês 4), análise e redação (meses 4–6).

---

## 17. Como o Claude deve trabalhar neste projeto

- Fazer **uma etapa por vez** e explicar antes de mudanças grandes.
- Código **simples e legível**, sem abstrações desnecessárias. Nomes descritivos (podem ser em português).
- Sempre indicar **quais RF/RN/RNF** cada mudança atende.
- Se algo não estiver definido aqui (ex.: ainda indefinido), **perguntar** em vez de inventar.
- Sugerir mensagem de commit em português ao final de cada etapa.
- Quando os autores pedirem "explica esse arquivo", explicar **linha a linha** em linguagem simples.
