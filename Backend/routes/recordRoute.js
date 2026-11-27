// Generic routes. Mount this AFTER the specific routes, because /:table matches any name.
const router = require('express').Router();
const c = require('../controllers/recordController');

router.post('/:table', c.create);
router.put('/:table/:id', c.update);
router.delete('/:table/:id', c.remove);

module.exports = router;
