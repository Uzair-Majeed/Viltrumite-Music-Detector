const express = require('express');
const router = express.Router();
const recognitionController = require('../controllers/recognitionController');
const upload = require('../middlewares/upload');

router.post('/recognize', upload.single('audio'), recognitionController.recognize);

module.exports = router;
