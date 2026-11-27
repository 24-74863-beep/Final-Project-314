// Whole-database actions: read everything, restore from a backup, reset to defaults.
const T = require('../models/tableMap');
const Record = require('../models/recordModel');
const Data = require('../models/dataModel');
const { getPool } = require('../config/db');
const { seed } = require('./seedService');
const { bad } = require('../utils/errors');

async function readAll() {
  const out = { v: 2 };
  for (const t of T.ORDER) out[t] = await Record.findAll(getPool(), t);
  return out;
}

async function importBackup(d) {
  d = d || {};
  for (const t of T.ORDER) if (!Array.isArray(d[t])) throw bad('Missing table: ' + t);
  if (!d.users.some(u => u.role === 'owner')) throw bad('Backup has no owner account');
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    await Data.wipe(conn);
    await Data.setForeignKeyChecks(conn, false);
    for (const t of T.ORDER) {
      for (const rec of d[t]) {
        const { row, extra } = Record.toRow(t, rec);
        if (!row.created_at) row.created_at = new Date().toISOString();
        if (Object.keys(extra).length) row.extra = JSON.stringify(extra);
        row.id = +rec.id;
        await Data.insertRow(conn, t, row);
      }
    }
    await Data.setForeignKeyChecks(conn, true);
    await conn.commit();
    await Data.resetAutoIncrement(conn);
  } catch (e) {
    await conn.rollback().catch(() => {});
    throw e;
  } finally {
    await Data.setForeignKeyChecks(conn, true).catch(() => {});
    conn.release();
  }
}

async function reset() {
  const conn = await getPool().getConnection();
  try { await Data.wipe(conn, true); } finally { conn.release(); }
  await seed();
}

module.exports = { readAll, importBackup, reset };
