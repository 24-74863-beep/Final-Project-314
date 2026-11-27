// Part stock changes. The update is a single atomic statement; stock never goes below 0.
const { q } = require('../config/db');

async function adjustStock(id, delta) {
  await q('UPDATE parts SET stock = GREATEST(0, stock + ?) WHERE id = ?', [delta, id]);
}

module.exports = { adjustStock };
