const express = require('express');
const router = express.Router();
const flowBuilder = require('./flowBuilder')

router.get('/getGallery',flowBuilder.getGallery);

module.exports = router;