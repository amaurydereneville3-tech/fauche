// Stockage : Postgres (Neon) si DATABASE_URL est défini, sinon un fichier data.json local.
const fs = require('fs');
const path = require('path');

const FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data.json');
let pool = null;
let mem = { users: {}, kv: {}, next: 1 };
let fileTimer = null;

async function init() {
  if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    // Peu de connexions et fermeture rapide : Neon peut se mettre en veille quand personne ne joue.
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 4, idleTimeoutMillis: 10000 });
    await pool.query(`create table if not exists users(
      id serial primary key, pseudo text not null, pseudo_lc text unique not null, pass text not null,
      data jsonb not null, worth double precision default 0, created timestamptz default now())`);
    await pool.query(`create table if not exists kv(k text primary key, v jsonb not null)`);
    console.log('Base de données : Postgres');
  } else {
    try { mem = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { /* premier lancement */ }
    console.log('Base de données : fichier local ' + FILE);
  }
}

function flushFile() {
  clearTimeout(fileTimer);
  fileTimer = setTimeout(() => { fs.writeFile(FILE, JSON.stringify(mem), () => {}); }, 500);
}

function flushNow() { if (pool || !mem) return; clearTimeout(fileTimer); try { fs.writeFileSync(FILE, JSON.stringify(mem)); } catch (e) { console.error('flush', e.message); } }

async function findByPseudo(lc) {
  if (pool) { const r = await pool.query('select id,pseudo,pass from users where pseudo_lc=$1', [lc]); return r.rows[0] || null; }
  const u = Object.values(mem.users).find(x => x.pseudo_lc === lc); return u ? { id: u.id, pseudo: u.pseudo, pass: u.pass } : null;
}
async function createUser(pseudo, pass, data) {
  if (pool) { const r = await pool.query('insert into users(pseudo,pseudo_lc,pass,data) values($1,$2,$3,$4) returning id', [pseudo, pseudo.toLowerCase(), pass, data]); return r.rows[0].id; }
  const id = mem.next++; mem.users[id] = { id, pseudo, pseudo_lc: pseudo.toLowerCase(), pass, data, worth: 0 }; flushFile(); return id;
}
async function loadUser(id) {
  if (pool) { const r = await pool.query('select id,pseudo,data from users where id=$1', [id]); return r.rows[0] || null; }
  const u = mem.users[id]; return u ? { id: u.id, pseudo: u.pseudo, data: JSON.parse(JSON.stringify(u.data)) } : null;
}
async function saveUser(id, data, worth) {
  if (pool) { await pool.query('update users set data=$2, worth=$3 where id=$1', [id, data, worth || 0]); return; }
  if (mem.users[id]) { mem.users[id].data = JSON.parse(JSON.stringify(data)); mem.users[id].worth = worth || 0; flushFile(); }
}
async function top(limit = 50) {
  if (pool) { const r = await pool.query('select id,pseudo,worth,data->\'av\' as av from users order by worth desc limit $1', [limit]); return r.rows; }
  return Object.values(mem.users).sort((a, b) => (b.worth || 0) - (a.worth || 0)).slice(0, limit).map(u => ({ id: u.id, pseudo: u.pseudo, worth: u.worth || 0, av: u.data.av }));
}
async function kvGet(k) {
  if (pool) { const r = await pool.query('select v from kv where k=$1', [k]); return r.rows[0] ? r.rows[0].v : null; }
  return mem.kv[k] === undefined ? null : JSON.parse(JSON.stringify(mem.kv[k]));
}
async function kvSet(k, v) {
  if (pool) { await pool.query('insert into kv(k,v) values($1,$2) on conflict (k) do update set v=$2', [k, JSON.stringify(v)]); return; }
  mem.kv[k] = JSON.parse(JSON.stringify(v)); flushFile();
}

async function getPass(id) {
  if (pool) { const r = await pool.query('select pass from users where id=$1', [id]); return r.rows[0] ? r.rows[0].pass : null; }
  return mem.users[id] ? mem.users[id].pass : null;
}
async function setPass(id, hash) {
  if (pool) { await pool.query('update users set pass=$2 where id=$1', [id, hash]); return; }
  if (mem.users[id]) { mem.users[id].pass = hash; flushFile(); }
}
async function rename(id, pseudo) {
  if (pool) { await pool.query('update users set pseudo=$2, pseudo_lc=$3 where id=$1', [id, pseudo, pseudo.toLowerCase()]); return; }
  if (mem.users[id]) { mem.users[id].pseudo = pseudo; mem.users[id].pseudo_lc = pseudo.toLowerCase(); flushFile(); }
}
async function deleteUser(id) {
  if (pool) { await pool.query('delete from users where id=$1', [id]); return; }
  delete mem.users[id]; flushFile();
}
async function count() {
  if (pool) { const r = await pool.query('select count(*)::int as n from users'); return r.rows[0].n; }
  return Object.keys(mem.users).length;
}
async function search(q, limit = 20) {
  const lc = String(q || '').toLowerCase();
  if (pool) { const r = await pool.query("select id,pseudo,worth from users where pseudo_lc like $1 order by worth desc limit $2", ['%' + lc.replace(/[%_]/g, '') + '%', limit]); return r.rows; }
  return Object.values(mem.users).filter(u => u.pseudo_lc.includes(lc)).slice(0, limit).map(u => ({ id: u.id, pseudo: u.pseudo, worth: u.worth || 0 }));
}

module.exports = { getPass, setPass, rename, deleteUser, count, search, flushNow, init, findByPseudo, createUser, loadUser, saveUser, top, kvGet, kvSet };
