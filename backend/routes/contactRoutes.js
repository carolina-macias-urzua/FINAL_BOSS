const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.get('/', contactController.getAll);
router.get('/search', contactController.search);
router.get('/:id', contactController.getById);
router.post('/', contactController.create);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.delete);
router.patch('/:id/favorite', contactController.toggleFavorite);

module.exports = router;