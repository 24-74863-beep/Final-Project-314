// Business rules for creating, updating and deleting records of any table.
const T = require('../models/tableMap');
const Record = require('../models/recordModel');
const { bad } = require('../utils/errors');

const tableOf = name => {
  if (!Object.prototype.hasOwnProperty.call(T, name)) throw bad('Unknown table.', 404);
  return name;
};

async function create(tableName, body) {
  const t = tableOf(tableName), def = T[t];
  const { row, extra } = Record.toRow(t, body || {});
  for (const k of Object.keys(def.json)) if (!(def.cols[k] in row)) row[def.cols[k]] = JSON.stringify(def.json[k]);
  if (t === 'repairs' && row.notes === undefined) row.notes = '';
  if (!row.created_at) row.created_at = new Date().toISOString();
  if (Object.keys(extra).length) row.extra = JSON.stringify(extra);
  const id = await Record.insert(t, row);
  return Record.findById(null, t, id);
}

async function update(tableName, id, body) {
  const t = tableOf(tableName);
  const { row, extra } = Record.toRow(t, body || {});
  const cur = await Record.findById(null, t, id);
  if (!cur) throw bad('Record not found.', 404);
  if (Object.keys(extra).length) {
    const old = await Record.getExtra(t, id);
    row.extra = JSON.stringify(Object.assign({}, old, extra));
  }
  await Record.update(t, id, row);
  return Record.findById(null, t, id);
}

async function remove(tableName, id) {
  await Record.remove(tableOf(tableName), id);
}

module.exports = { create, update, remove };
