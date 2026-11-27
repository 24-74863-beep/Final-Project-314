// Inserts for the default data.
const { q } = require('../config/db');

async function countUsers() {
  const [[{ n }]] = await q('SELECT COUNT(*) AS n FROM users');
  return n;
}
const insertOwner = (name, username, passHash, now) =>
  q('INSERT INTO users (role, name, username, pass_hash, phone, created_at) VALUES (?,?,?,?,?,?)', ['owner', name, username, passHash, '', now]);
const insertMechanic = (name, skills, now) =>
  q('INSERT INTO mechanics (name, phone, skills, created_at) VALUES (?,?,?,?)', [name, '', JSON.stringify(skills), now]);
const insertServices = (list, now) =>
  q('INSERT INTO services (name, price, created_at) VALUES ?', [list.map(s => [s[0], s[1], now])]);
const insertParts = (list, now) =>
  q('INSERT INTO parts (name, price, stock, created_at) VALUES ?', [list.map(p => [p[0], p[1], p[2], now])]);

module.exports = { countUsers, insertOwner, insertMechanic, insertServices, insertParts };
