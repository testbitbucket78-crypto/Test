const express = require('express');
const router=express.Router();
const db = require("../dbhelper");
const userController=require('./user.js');
const indexController=require('./index.js');

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
router.post('/resetPassword/:id',indexController.resetPassword)
router.post('/allAgents',userController.getAllAgents)
router.post('/isActiveAgents',userController.getisActiveAgents)



/**Added by Raman Bhasker*/

const TeamBoxController=require('./TeamBoxController.js');

router.get('/agents/:spID',TeamBoxController.getAllAgents);
router.get('/customers/:spID',TeamBoxController.getAllCustomer);
router.get('/searchcustomers/:Channel/:spID',TeamBoxController.searchCustomer);
router.get('/searchcustomers/:Channel/:spID/:key',TeamBoxController.searchCustomer);
router.post('/addcustomers',TeamBoxController.insertCustomers);
router.post('/blockcustomer',TeamBoxController.blockCustomer);

router.post('/interaction',TeamBoxController.createInteraction);
router.post('/updateinteraction',TeamBoxController.updateInteraction);

router.get('/interaction',TeamBoxController.getAllInteraction);
router.get('/interaction/:InteractionId',TeamBoxController.getInteractionById);
router.get('/filterinteraction/:filterBy/:AgentId',TeamBoxController.getFilteredInteraction);
router.get('/interactionpinned/:InteractionId/:AgentId',TeamBoxController.checkInteractionPinned);
router.get('/searchinteraction/:searchKey/:AgentId',TeamBoxController.getSearchInteraction);


router.get('/messages/:InteractionId/:Type',TeamBoxController.getAllMessageByInteractionId);
router.post('/newmessage',TeamBoxController.insertMessage);
router.post('/deletemessage',TeamBoxController.deleteMessage);
router.post('/updatemessageread',TeamBoxController.updateMessageRead);
router.post('/interactionmapping',TeamBoxController.updateInteractionMapping);
router.get('/interactionmapping/:InteractionId',TeamBoxController.getInteractionMapping);


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
const file = req.file;
if (!file) {
res.send({message:'File no uplaoded...'})
}
const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
res.send({filename:url})
  
});

router.get('/uploads/:fileName', async (req, res)=> {

  fs.readFile('./uploads/'+req.params.fileName, function(err, data) {
     if (!err){ 
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      res.end(data); // Send the file data to the browser.
      }
  });
  
});


module.exports = router;