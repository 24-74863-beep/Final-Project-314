// Generic record endpoints: POST /api/:table, PUT /api/:table/:id, DELETE /api/:table/:id
const Records = require('../services/recordService');
const { wrap } = require('../middleware/asyncHandler');
const { touch } = require('../middleware/revision');

exports.create = wrap(async (req, res) => {
  const rec = await Records.create(req.params.table, req.body);
  touch(res);
  res.status(201).json(rec);
});

exports.update = wrap(async (req, res) => {
  const rec = await Records.update(req.params.table, +req.params.id, req.body);
  touch(res);
  res.json(rec);
});

exports.remove = wrap(async (req, res) => {
  await Records.remove(req.params.table, +req.params.id);
  touch(res);
  res.json({ ok: true });
});
