import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Teste de segurança do banco (RNF01, RNF02): aplica a migração num Postgres local (PGlite) e tenta
// "atacar" cada regra como se fosse um usuário comum. Rodar com: npm run test:rls
const pasta = fileURLToPath(new URL('../migrations/', import.meta.url));
const db = new PGlite();
// Stubs do Supabase: schema auth, papéis e auth.uid()/auth.role().
await db.exec(`
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated, anon, service_role;
grant usage on schema public to anon;
grant execute on function auth.uid() to authenticated, anon, service_role;
`);
for (const arq of fs.readdirSync(pasta).filter((f) => f.endsWith('.sql')).sort()) await db.exec(fs.readFileSync(pasta + arq, 'utf8'));
console.log('migração aplicada');
const q = async (s)=> (await db.query(s)).rows;
const as = async (uid, role, sql) => { await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub','${uid||''}',false);`); try { const r = await db.query(sql); return {ok:true,rows:r.rows}; } catch(e){ return {ok:false,err:e.message}; } finally { await db.exec('reset role;'); } };
const A='00000000-0000-0000-0000-00000000000a', B='00000000-0000-0000-0000-00000000000b', C='00000000-0000-0000-0000-00000000000c';
await db.exec(`insert into auth.users(id,email) values ('${A}','a@x.com'),('${B}','b@x.com'),('${C}','c@x.com');`);
console.log('perfis criados pelo trigger:', (await q('select count(*)::int n from profiles'))[0].n);
await db.exec(`update profiles set role='admin' where id='${C}'`);
const res = [];
const t = (nome, cond) => { res.push([cond?'OK  ':'FALHOU', nome]); };
// RN02: usuário comum não altera o próprio XP/nível
let r = await as(A,'authenticated',`update profiles set xp=999999, level=100 where id='${A}'`); t('usuário não altera o próprio XP (RN02)', !r.ok);
// RN01: usuário comum não vira admin
r = await as(A,'authenticated',`update profiles set role='admin' where id='${A}'`); t('usuário não altera o próprio papel (RN01)', !r.ok);
// admin pode mudar papel
r = await as(C,'authenticated',`update profiles set role='suporte' where id='${B}'`); t('admin altera papel de outro (RN01)', r.ok);
await db.exec(`update profiles set role='usuario' where id='${B}'`);
// usuário edita a própria bio
r = await as(A,'authenticated',`update profiles set bio='oi' where id='${A}'`); t('usuário edita a própria bio', r.ok);
// usuário não edita bio de outro (0 linhas afetadas)
r = await as(A,'authenticated',`update profiles set bio='hack' where id='${B}' returning id`); t('usuário não edita perfil de outro', r.ok && r.rows.length===0);
// conceder_xp: só service_role
r = await as(A,'authenticated',`select conceder_xp('${A}','teste',100)`); t('usuário não chama conceder_xp (RN02)', !r.ok);
r = await as(null,'service_role',`select (conceder_xp('${A}','teste',35001)).level lvl`); t('service_role concede XP e calcula nível 84', r.ok && r.rows[0].lvl===84);
r = await as(null,'service_role',`select (conceder_xp('${B}','teste',49500)).level lvl`); t('49.500 XP = nível 100', r.ok && r.rows[0].lvl===100);
r = await as(null,'service_role',`select (conceder_xp('${B}','teste',999999)).level lvl`); t('nível limitado a 100', r.ok && r.rows[0].lvl===100);
// confere fórmula SQL x TS em vários pontos
let ok=true; for (const [xp,lv] of [[0,1],[9,1],[10,2],[29,2],[30,3],[34859,83],[34860,84],[35699,84],[35700,85]]) {
  await db.exec(`update profiles set xp=0, level=1 where id='${C}'`);
  const x = (await db.query(`select (conceder_xp('${C}','t',${xp})).level l`)).rows[0].l; if (x!==lv){ok=false;console.log('xp',xp,'esperado',lv,'obtido',x);} }
t('fórmula de nível em SQL nos limites', ok);
// roleta atômica: 3 giros, o 4º é recusado
const dia='2026-11-09'; const giros=[];
for (let i=0;i<4;i++){ giros.push((await as(null,'service_role',`select gastar_giro('${A}','${dia}') g`)).rows[0].g); }
t('roleta: 3 giros e o 4º recusado (RN04)', giros.join()==='1,2,3,' || (giros[0]===1&&giros[1]===2&&giros[2]===3&&giros[3]===null));
r = await as(A,'authenticated',`select gastar_giro('${A}','${dia}')`); t('usuário não chama gastar_giro', !r.ok);
// usuário não escreve na coleção/check-in
r = await as(A,'authenticated',`insert into daily_logs(user_id,day,week_start) values ('${A}','2026-11-09','2026-11-08')`); t('usuário não grava check-in direto (RNF02)', !r.ok);
// amizade
r = await as(A,'authenticated',`insert into friendships(requester_id,addressee_id) values ('${A}','${B}') returning id`); t('usuário envia pedido de amizade', r.ok);
const fid = r.rows[0]?.id;
r = await as(A,'authenticated',`update friendships set status='aceita' where id='${fid}' returning id`); t('remetente não aceita a própria amizade (RN09)', r.ok && r.rows.length===0);
r = await as(B,'authenticated',`update friendships set status='aceita' where id='${fid}' returning id`); t('destinatário aceita (RN09)', r.ok && r.rows.length===1);
r = await as(A,'authenticated',`insert into friendships(requester_id,addressee_id) values ('${B}','${A}')`); t('par de amizade não duplica', !r.ok);
// mensagens
await db.exec(`insert into direct_messages(sender_id,receiver_id,text) values ('${A}','${B}','oi')`);
r = await as(C,'authenticated',`select * from direct_messages`); t('terceiro não lê mensagem direta (RN10)', r.ok && r.rows.length===0);
r = await as(B,'authenticated',`select * from direct_messages`); t('destinatário lê a mensagem', r.ok && r.rows.length===1);
r = await as(A,'authenticated',`insert into direct_messages(sender_id,receiver_id,text) values ('${B}','${A}','forjada')`); t('não envia mensagem como outra pessoa', !r.ok);
// jogo / avaliação
await db.exec(`insert into games(id,title) values ('10000000-0000-0000-0000-000000000001','Jogo X')`);
r = await as(A,'authenticated',`insert into games(title) values ('hack')`); t('usuário comum não cadastra jogo (RF18)', !r.ok);
r = await as(C,'authenticated',`insert into games(title) values ('ok')`); t('admin cadastra jogo', r.ok);
r = await as(A,'authenticated',`insert into ratings(user_id,game_id,score) values ('${A}','10000000-0000-0000-0000-000000000001',8)`); t('avalia jogo', r.ok);
r = await as(A,'authenticated',`insert into ratings(user_id,game_id,score) values ('${A}','10000000-0000-0000-0000-000000000001',9)`); t('uma avaliação por jogo (RN05)', !r.ok);
// trocas
await db.exec(`insert into collectibles(id,title,rarity) values ('20000000-0000-0000-0000-000000000001','Arte 1','rara'),('20000000-0000-0000-0000-000000000002','Arte 2','epica')`);
await db.exec(`insert into user_collection values ('${A}','20000000-0000-0000-0000-000000000001',2,now()),('${B}','20000000-0000-0000-0000-000000000002',2,now())`);
r = await as(A,'authenticated',`insert into trades(proposer_id,receiver_id,offered_collectible_id,requested_collectible_id) values ('${A}','${B}','20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002') returning id`); t('propõe troca de cópia repetida (RN18)', r.ok);
const tid=r.rows[0]?.id;
r = await as(C,'authenticated',`select * from trades`); t('terceiro não vê a troca', r.ok && r.rows.length===0);
r = await as(A,'authenticated',`update trades set status='aceita' where id='${tid}' returning id`); t('proponente não se auto-aceita (RN19)', !r.ok || r.rows.length===0);
r = await as(B,'authenticated',`update trades set status='aceita' where id='${tid}' returning id`); t('destinatário não aceita direto pelo navegador (RN19)', !r.ok || r.rows.length===0);
r = await as(null,'service_role',`select aceitar_troca('${tid}','${B}')`); t('aceitar_troca efetiva a troca', r.ok);
const col = (await q(`select user_id, collectible_id, quantity from user_collection order by user_id, collectible_id`));
const qtd=(u,c)=>col.find(x=>x.user_id===u&&x.collectible_id===c)?.quantity;
t('A ficou com 1 da Arte 1 e 1 da Arte 2', qtd(A,'20000000-0000-0000-0000-000000000001')===1 && qtd(A,'20000000-0000-0000-0000-000000000002')===1);
t('B ficou com 1 da Arte 2 e 1 da Arte 1', qtd(B,'20000000-0000-0000-0000-000000000002')===1 && qtd(B,'20000000-0000-0000-0000-000000000001')===1);
r = await as(A,'authenticated',`insert into trades(proposer_id,receiver_id,offered_collectible_id,requested_collectible_id) values ('${A}','${B}','20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002')`); t('não propõe troca sem cópia repetida (RN18)', !r.ok);
r = await as(null,'service_role',`select aceitar_troca('${tid}','${B}')`); t('troca já aceita não repete', !r.ok);
r = await as(null,'anon',`select * from games`); t('visitante sem login não lê o catálogo (RF01)', !r.ok);
r = await as(null,'anon',`select * from profiles`); t('visitante sem login não lê perfis (RF01)', !r.ok);
console.log(res.map(x=>x.join(' ')).join('\n'));
const falhas = res.filter(x=>x[0]==='FALHOU').length;
console.log(falhas ? 'HÁ FALHAS' : 'TODOS OS TESTES PASSARAM ('+res.length+')');
process.exit(falhas ? 1 : 0);
