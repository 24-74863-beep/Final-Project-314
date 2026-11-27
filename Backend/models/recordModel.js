// Generic table access: reads, inserts, updates and deletes, plus record <-> row conversion.
const T = require('./tableMap');
const { q, getPool } = require('../config/db');

function parseJson(v, dflt) {
  if (v === null || v === undefined) return dflt;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch (e) { return dflt; } }
  return v;   // MySQL JSON columns are usually already parsed
}

// Table row -> app record
function toRecord(table, row) {
  const t = T[table], o = { id: row.id };
  for (const k of Object.keys(t.cols)) {
    let v = row[t.cols[k]];
    if (k in t.json) v = parseJson(v, t.json[k]);
    else if (t.bool.includes(k)) v = v === null || v === undefined ? false : !!v;
    o[k] = v === undefined ? null : v;
  }
  const extra = parseJson(row.extra, null);
  if (extra && typeof extra === 'object') for (const k of Object.keys(extra)) if (!(k in o)) o[k] = extra[k];
  return o;
}

// App record (or patch) -> { column: value }, plus any leftover fields for `extra`
function toRow(table, rec) {
  const t = T[table], row = {}, extra = {};
  for (const k of Object.keys(rec)) {
    if (k === 'id') continue;
    const v = rec[k];
    if (v === undefined) continue;
    if (t.cols[k]) {
      if (k in t.json) row[t.cols[k]] = JSON.stringify(v === null ? t.json[k] : v);
      else if (t.bool.includes(k)) row[t.cols[k]] = v ? 1 : 0;
      else row[t.cols[k]] = v;
    } else extra[k] = v;
  }
  return { row, extra };
}

async function findAll(conn, table) {
  const [rows] = await conn.query('SELECT * FROM `' + table + '` ORDER BY id');
  return rows.map(r => toRecord(table, r));
}

async function findById(conn, table, id) {
  const [rows] = await (conn || getPool()).query('SELECT * FROM `' + table + '` WHERE id = ?', [id]);
  return rows.length ? toRecord(table, rows[0]) : null;
}

async function getExtra(table, id) {
  const [[r]] = await q('SELECT extra FROM `' + table + '` WHERE id = ?', [id]);
  return r.extra && typeof r.extra === 'string' ? JSON.parse(r.extra) : (r.extra || {});
}

async function insert(table, row) {
  const keys = Object.keys(row);
  const [r] = await q('INSERT INTO `' + table + '` (' + keys.map(k => '`' + k + '`').join(',') + ') VALUES (' + keys.map(() => '?').join(',') + ')', keys.map(k => row[k]));
  return r.insertId;
}

async function update(table, id, row) {
  const keys = Object.keys(row);
  if (!keys.length) return;
  await q('UPDATE `' + table + '` SET ' + keys.map(k => '`' + k + '` = ?').join(', ') + ' WHERE id = ?', keys.map(k => row[k]).concat([id]));
}

async function remove(table, id) {
  await q('DELETE FROM `' + table + '` WHERE id = ?', [id]);
}

module.exports = { toRecord, toRow, findAll, findById, getExtra, insert, update, remove };
