// Part stock adjustments.
const Part = require('../models/partModel');
const Record = require('../models/recordModel');

async function adjust(id, delta) {
  await Part.adjustStock(id, Math.trunc(+delta || 0));
  return Record.findById(null, 'parts', id);
}

module.exports = { adjust };
