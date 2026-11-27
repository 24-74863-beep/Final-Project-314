// Whole-database operations used by backup/restore and reset.
const T = require('./tableMap');

// Empties every table (children first). resetAuto also restarts the id counters.
async function wipe(conn, resetAuto) {
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of T.ORDER.slice().reverse()) await conn.query('DELETE FROM `' + t + '`');
  if (resetAuto) for (const t of T.ORDER) await conn.query('ALTER TABLE `' + t + '` AUTO_INCREMENT = 1');   // ALTER TABLE commits implicitly, so this runs outside a transaction
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
}

const setForeignKeyChecks = (conn, on) => conn.query('SET FOREIGN_KEY_CHECKS = ' + (on ? 1 : 0));

async function insertRow(conn, table, row) {
  const keys = Object.keys(row);
  await conn.query('INSERT INTO `' + table + '` (' + keys.map(k => '`' + k + '`').join(',') + ') VALUES (' + keys.map(() => '?').join(',') + ')', keys.map(k => row[k]));
}

// ALTER TABLE commits implicitly, so the auto-increment counters are reset after the transaction
async function resetAutoIncrement(conn) {
  for (const t of T.ORDER) {
    const [[{ m }]] = await conn.query('SELECT COALESCE(MAX(id),0)+1 AS m FROM `' + t + '`');
    await conn.query('ALTER TABLE `' + t + '` AUTO_INCREMENT = ' + (+m));
  }
}

module.exports = { wipe, setForeignKeyChecks, insertRow, resetAutoIncrement };
