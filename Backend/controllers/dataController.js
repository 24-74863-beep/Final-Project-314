// Version, full data read, backup restore and reset.
const Data = require('../services/dataService');
const { wrap } = require('../middleware/asyncHandler');
const { touch, current } = require('../middleware/revision');

exports.version = (req, res) => res.json({ rev: current() });

exports.all = wrap(async (req, res) => {
  const d = await Data.readAll();
  d.rev = current();
  res.json(d);
});

exports.importBackup = wrap(async (req, res) => {
  await Data.importBackup(req.body);
  touch(res);
  res.json({ ok: true });
});

exports.reset = wrap(async (req, res) => {
  await Data.reset();
  touch(res);
  res.json({ ok: true });
});
