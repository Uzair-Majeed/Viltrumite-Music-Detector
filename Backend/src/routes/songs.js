const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const authMiddleware = require('../middlewares/auth');

router.get('/stats', songController.getStats);
router.get('/songs', songController.getAllSongs);
router.post('/manual-index', authMiddleware, songController.manualIndex);

module.exports = router;
