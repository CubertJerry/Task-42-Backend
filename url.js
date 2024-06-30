const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.post('/shorten', urlController.createShortUrl);
router.get('/:shortUrl', urlController.getShortUrl);
router.get('/all', urlController.getAllUrls);
router.get('/stats', urlController.getUrlStats);

module.exports = router;