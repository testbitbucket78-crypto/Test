const express = require('express');
var app = express();
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
const {v4 : uuidv4} = require('uuid')
const router=express.Router();
const db = require("../dbhelper");
const userController=require('./user.js');
const indexController=require('./index.js');
const awsHelper = require('../awsHelper');
const path = require("path");
const authenticateToken = require('../Authorize');

router.get('/users',authenticateToken,userController.getUser);
router.get('/users/:id',authenticateToken,userController.getUserById);
router.delete('/users/:id',authenticateToken,authenticateToken,userController.deletUserById);
router.post('/users',authenticateToken,userController.insertUser);
router.put('/users/:id',authenticateToken,userController.updateUser);
router.get('/getAllRegisteredUser',authenticateToken,indexController.allregisterdUser);
router.post('/register',indexController.register);
router.post('/login',indexController.login);
router.post('/forgotPassword',authenticateToken,indexController.forgotPassword);
router.post('/sendOtp',indexController.sendOtp)
router.post('/verifyOtp',indexController.verifyOtp)
router.post('/resetPassword/:uid',authenticateToken,indexController.resetPassword)
router.post('/allAgents',authenticateToken,userController.getAllAgents)
router.post('/isActiveAgents',authenticateToken,userController.getisActiveAgents)
router.post('/verifyPhoneOtp',indexController.verifyPhoneOtp)
router.post('/isSpAlreadyExist',indexController.isSpAlreadyExist)

/**Added by Raman Bhasker*/

const TeamBoxController=require('./TeamBoxController.js');

router.get('/agents/:spID',authenticateToken,TeamBoxController.getAllAgents);
router.get('/customers/:spID/:RangeStart/:RangeEnd',authenticateToken,TeamBoxController.getAllCustomer);
router.get('/searchcustomers/:Channel/:spID',authenticateToken,TeamBoxController.searchCustomer);
router.get('/searchcustomers/:Channel/:spID/:key',authenticateToken,TeamBoxController.searchCustomer);
router.post('/addcustomers',authenticateToken,TeamBoxController.insertCustomers);
router.post('/updatedCustomer',authenticateToken,TeamBoxController.updatedCustomer);
router.post('/updateTags',authenticateToken,TeamBoxController.updateTags);


router.post('/blockcustomer',authenticateToken,TeamBoxController.blockCustomer);

router.post('/interaction',authenticateToken,TeamBoxController.createInteraction);
router.post('/updateinteraction',authenticateToken,TeamBoxController.updateInteraction);
router.post('/deleteInteraction',authenticateToken,TeamBoxController.deleteInteraction);

router.post('/getAllInteraction',authenticateToken,TeamBoxController.getAllFilteredInteraction);
router.get('/interaction',authenticateToken,TeamBoxController.getAllInteraction);
router.get('/interaction/:InteractionId',authenticateToken,TeamBoxController.getInteractionById);
router.get('/filterinteraction/:filterBy/:AgentId/:AgentName/:SPID',authenticateToken,TeamBoxController.getFilteredInteraction);
router.get('/interactionpinned/:InteractionId/:AgentId',authenticateToken,TeamBoxController.checkInteractionPinned);
router.post('/interactionpinned',authenticateToken,TeamBoxController.updatePinnedStatus);
router.get('/searchinteraction/:searchKey/:AgentId/:spid',authenticateToken,TeamBoxController.getSearchInteraction);


router.get('/messages/:InteractionId/:Type/:RangeStart/:RangeEnd/:spid',TeamBoxController.getAllMessageByInteractionId);
router.post('/newmessage',authenticateToken,TeamBoxController.insertMessage);
router.post('/deletemessage',authenticateToken,TeamBoxController.deleteMessage);
router.post('/updatemessageread',authenticateToken,TeamBoxController.updateMessageRead);
router.post('/interactionmapping',authenticateToken,TeamBoxController.updateInteractionMapping);
router.post('/resetInteractionMapping',authenticateToken,TeamBoxController.resetInteractionMapping);
router.get('/interactionmapping/:InteractionId',authenticateToken,TeamBoxController.getInteractionMapping);
router.get('/getsavedMessages/:SPID',authenticateToken,TeamBoxController.getsavedMessages);
router.get('/getsavedMessages/:Message_id/:SP_ID',authenticateToken,TeamBoxController.getMessagesByMsgId);
router.get('/getquickReply/:SPID',authenticateToken,TeamBoxController.getquickReply);
router.get('/getTemplates/:SPID',authenticateToken,TeamBoxController.getTemplates);

router.post('/editNotes',authenticateToken,TeamBoxController.updateNotes)
router.post('/addAction',authenticateToken,TeamBoxController.addAction)


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
router.post('/uploadfile/:spid/:name',upload.single('dataFile'),authenticateToken, async (req, res)=> {
   try{   
const file = req.file;

if (!file) {
res.send({message:'File no uplaoded...'})
}
const url =  path.join(__dirname, `/uploads/${file.filename}`)//`${req.protocol}://${req.get('host')}/uploads/${file.filename}`

// Get file stats to obtain file size
const stats = await fs.stat(url);

const fileSizeInBytes = stats?.size;
const fileSizeInKilobytes = fileSizeInBytes / 1024;
const fileSizeInMegabytes = fileSizeInKilobytes / 1024;
if(fileSizeInMegabytes <= 10){

console.log(url)

const uuidv = uuidv4()

let awsres = await awsHelper.uploadAttachment(`${req.params.spid}/${req.params.name}/${uuidv}/${file.filename}`, url,file.mimetype)
 

console.log("awsres" ,awsres.size)
//console.log(awsres.value.Location)
await fs.unlink(url);

res.send({status:200,filename:awsres.value.Location,fileSize:awsres.size})
}else{
  
  try {
   await fs.unlink(url); 
} catch (unlinkErr) {
   console.error("Error occurred while unlinking file:", unlinkErr);
}
res.status(413).send({ message: 'File size limit exceeds 10MB' });
}
}catch(err){
   console.log(err)
   res.send({status:500,err:err})
}
});

router.get('/uploads/:fileName',authenticateToken, async (req, res)=> {
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

router.post('/getCampaigns',authenticateToken,CampaignsController.getCampaigns);
router.post('/addCampaign',authenticateToken,CampaignsController.addCampaign);
router.get('/getCampaignDetail/:CampaignId',authenticateToken,CampaignsController.getCampaignDetail);
router.get('/deleteCampaign/:CampaignId',authenticateToken,CampaignsController.deleteCampaign);
router.post('/getFilteredCampaign',authenticateToken,CampaignsController.getFilteredCampaign);
router.post('/getContactList',authenticateToken,CampaignsController.getContactList);
router.post('/updatedContactList',authenticateToken,CampaignsController.updatedContactList);
router.post('/addNewContactList',authenticateToken,CampaignsController.addNewContactList);
router.post('/deleteContactList',authenticateToken,CampaignsController.deleteContactList);
router.post('/applyFilterOnEndCustomer',authenticateToken,CampaignsController.applyFilterOnEndCustomer);
router.get('/getAdditiionalAttributes/:SPID',authenticateToken,CampaignsController.getAdditiionalAttributes);
router.get('/getEndCustomerDetail/:customerId',authenticateToken,CampaignsController.getEndCustomerDetail);
router.get('/getContactAttributesByCustomer/:customerId',authenticateToken,authenticateToken,CampaignsController.getContactAttributesByCustomer);
router.post('/sendCampinMessage',authenticateToken,CampaignsController.sendCampinMessage);
router.post('/saveCampaignMessages',authenticateToken,CampaignsController.saveCampaignMessages);

router.get('/getCampaignMessages/:CampaignId',authenticateToken,CampaignsController.getCampaignMessages);
router.get('/copyCampaign/:CampaignId',authenticateToken,CampaignsController.copyCampaign);

router.post('/alertUser',authenticateToken,CampaignsController.campaignAlerts);
router.get('/exitCampaign/:title/:spid/:Id',authenticateToken,CampaignsController.isExistCampaign);
router.post('/processQuery',authenticateToken,CampaignsController.processContactQueries)
app.get('/csvSample', authenticateToken,CampaignsController.download)

module.exports = router;