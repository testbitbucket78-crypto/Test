const express = require('express');
const router=express.Router();
const db = require("../dbhelper");
const userController=require('./user.js');
const indexController=require('./index.js');
const awsHelper = require('../awsHelper');
const path = require("path");

router.get('/users',userController.getUser);
router.get('/users/:id',userController.getUserById);
router.delete('/users/:id',userController.deletUserById);
router.post('/users',userController.insertUser);
router.put('/users/:id',userController.updateUser);
router.get('/getAllRegisteredUser',indexController.allregisterdUser);
router.post('/register',indexController.register);
router.post('/login',indexController.login);
router.post('/forgotPassword',indexController.forgotPassword);
router.post('/sendOtp',indexController.sendOtp)
router.post('/verifyOtp',indexController.verifyOtp)
router.post('/resetPassword/:uid',indexController.resetPassword)
router.post('/allAgents',userController.getAllAgents)
router.post('/isActiveAgents',userController.getisActiveAgents)
router.post('/verifyPhoneOtp',indexController.verifyPhoneOtp)


/**Added by Raman Bhasker*/

const TeamBoxController=require('./TeamBoxController.js');

router.get('/agents/:spID',TeamBoxController.getAllAgents);
router.get('/customers/:spID',TeamBoxController.getAllCustomer);
router.get('/searchcustomers/:Channel/:spID',TeamBoxController.searchCustomer);
router.get('/searchcustomers/:Channel/:spID/:key',TeamBoxController.searchCustomer);
router.post('/addcustomers',TeamBoxController.insertCustomers);
router.post('/updatedCustomer',TeamBoxController.updatedCustomer);
router.post('/updateTags',TeamBoxController.updateTags);


router.post('/blockcustomer',TeamBoxController.blockCustomer);

router.post('/interaction',TeamBoxController.createInteraction);
router.post('/updateinteraction',TeamBoxController.updateInteraction);
router.post('/deleteInteraction',TeamBoxController.deleteInteraction);

router.post('/getAllInteraction',TeamBoxController.getAllFilteredInteraction);
router.get('/interaction',TeamBoxController.getAllInteraction);
router.get('/interaction/:InteractionId',TeamBoxController.getInteractionById);
router.get('/filterinteraction/:filterBy/:AgentId/:AgentName',TeamBoxController.getFilteredInteraction);
router.get('/interactionpinned/:InteractionId/:AgentId',TeamBoxController.checkInteractionPinned);
router.post('/interactionpinned',TeamBoxController.updatePinnedStatus);
router.get('/searchinteraction/:searchKey/:AgentId',TeamBoxController.getSearchInteraction);


router.get('/messages/:InteractionId/:Type',TeamBoxController.getAllMessageByInteractionId);
router.post('/newmessage',TeamBoxController.insertMessage);
router.post('/deletemessage',TeamBoxController.deleteMessage);
router.post('/updatemessageread',TeamBoxController.updateMessageRead);
router.post('/interactionmapping',TeamBoxController.updateInteractionMapping);
router.post('/resetInteractionMapping',TeamBoxController.resetInteractionMapping);
router.get('/interactionmapping/:InteractionId',TeamBoxController.getInteractionMapping);
router.get('/getsavedMessages/:SPID',TeamBoxController.getsavedMessages);
router.get('/getquickReply/:SPID',TeamBoxController.getquickReply);
router.get('/getTemplates/:SPID',TeamBoxController.getTemplates);


const multer = require('multer');
let fs = require('fs-extra');
// handle storage using multer
var storage = multer.diskStorage({
   destination: function (req, file, cb) {
      //cb(null, '/var/www/api/uploads');
     
    let path = `./uploads`;
    fs.mkdirsSync(path);
    cb(null, path);
    
   },
   filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
   }
});
var upload = multer({ storage: storage });

// handle single file upload
router.post('/uploadfile/',upload.single('dataFile'), async (req, res)=> {
   try{
const file = req.file;

if (!file) {
res.send({message:'File no uplaoded...'})
}
const url =  path.join(__dirname, `/uploads/${file.filename}`)//`${req.protocol}://${req.get('host')}/uploads/${file.filename}`

console.log(url)

 let awsres = await awsHelper.uploadFileToAws('localtoAws/teambox_img.jpg', url)

console.log("awsres")
//console.log(awsres.value.Location)
await fs.unlink(url);
console.log(url)
res.send({filename:awsres.value.Location})

}catch(err){
   console.log(err)
   res.send({err:err})
}
});

router.get('/uploads/:fileName', async (req, res)=> {
console.log("/uploads/:fileName")
  fs.readFile('./uploads/'+req.params.fileName, function(err, data) {
     if (!err){ 
     const file = './uploads/'+req.params.fileName
      res.download(file);
     // res.writeHead(200, {'Content-Type': 'image/jpeg'});
      //res.end(data); // Send the file data to the browser.
      }
  });
  
});




/////////////////////////Campaigns API added by Raman Bhasker//////////////////////////
const CampaignsController=require('./CampaignsController.js');

router.post('/getCampaigns',CampaignsController.getCampaigns);
router.post('/addCampaign',CampaignsController.addCampaign);
router.get('/getCampaignDetail/:CampaignId',CampaignsController.getCampaignDetail);
router.get('/deleteCampaign/:CampaignId',CampaignsController.deleteCampaign);
router.post('/getFilteredCampaign',CampaignsController.getFilteredCampaign);
router.post('/getContactList',CampaignsController.getContactList);
router.post('/updatedContactList',CampaignsController.updatedContactList);
router.post('/addNewContactList',CampaignsController.addNewContactList);
router.post('/applyFilterOnEndCustomer',CampaignsController.applyFilterOnEndCustomer);
router.get('/getAdditiionalAttributes/:SPID',CampaignsController.getAdditiionalAttributes);
router.get('/getEndCustomerDetail/:customerId',CampaignsController.getEndCustomerDetail);
router.get('/getContactAttributesByCustomer/:customerId',CampaignsController.getContactAttributesByCustomer);
router.post('/sendCampinMessage',CampaignsController.sendCampinMessage);
router.post('/saveCampaignMessages',CampaignsController.saveCampaignMessages);

router.get('/getCampaignMessages/:CampaignId',CampaignsController.getCampaignMessages);
router.get('/copyCampaign/:CampaignId',CampaignsController.copyCampaign);

router.post('/alertUser',CampaignsController.campaignAlerts)

module.exports = router;