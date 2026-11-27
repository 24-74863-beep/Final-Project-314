// POST /api/parts/:id/adjust
const Parts = require('../services/partService');
const { wrap } = require('../middleware/asyncHandler');
const { touch } = require('../middleware/revision');

exports.adjust = wrap(async (req, res) => {
  const part = await Parts.adjust(+req.params.id, req.body.delta);
  touch(res);
  res.json(part);
});
