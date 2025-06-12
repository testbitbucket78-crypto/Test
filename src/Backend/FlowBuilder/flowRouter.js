const express = require('express');
const router = express.Router();
const flowBuilder = require('./flowBuilder')

router.get('/getGallery',flowBuilder.getGallery);
router.get('/addBot',flowBuilder.addBot);
//router.get('/searchBot',flowBuilder.searchBot);
router.get('/checkExistingBot',flowBuilder.checkExistingBot);
router.get('/getAllBots',flowBuilder.getAllBots);
router.get('/getBotDetailById',flowBuilder.getBotDetailById);
router.get('/submitBots',flowBuilder.submitBots);
router.get('/deleteBotbyId',flowBuilder.deleteBotbyId);

module.exports = router;