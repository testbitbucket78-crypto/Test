const express = require('express');
const router = express.Router();
const flowBuilder = require('./flowBuilder')

router.get('/getGallery',flowBuilder.getGallery);
router.post('/addBot',flowBuilder.addBot);
router.post('/exportFlowData',flowBuilder.exportFlowData);
router.post('/updateBotDetails',flowBuilder.updateBotDetails);
//router.get('/searchBot',flowBuilder.searchBot);
router.post('/checkExistingBot',flowBuilder.checkExistingBot);
router.post('/checkExistingKeyword',flowBuilder.checkExistingKeyword);
router.get('/getAllBots/:spid',flowBuilder.getAllBots);
router.get('/getBotDetailById/:spid/:botId',flowBuilder.getBotDetailById);
router.post('/submitBots',flowBuilder.submitBots);
router.get('/deleteBotbyId/:spid/:botId/:type',flowBuilder.deleteBotbyId);
router.get('/healthCheck', flowBuilder.healthCheck);

module.exports = router;