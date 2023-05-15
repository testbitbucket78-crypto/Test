const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const val=require('./TeamBoxConstant')
const app = express();
const bcrypt = require('bcrypt');
const http = require("https");

const multer = require('multer');
let fs = require('fs-extra');


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


// handle storage using multer
var storage = multer.diskStorage({
   destination: function (req, file, cb) {
    let path = `./uploads/`;
    fs.mkdirsSync(path);
    cb(null, path);
    
   },
   filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
   }
});
var upload = multer({ storage: storage });

const uploadfile = (req, res) => {
    upload.single('dataFile') 
    const file = req.file;
    
};

const getAllAgents = (req, res) => {
    db.runQuery(req,res,val.selectAllAgentsQuery,[req.params.spID]);
};



const getAllCustomer = (req, res) => {
    db.runQuery(req,res,val.selectAllQuery,[req.params.spID]);
};

const getCustomerById = (req, res) => {
db.runQuery(req,res,val.selectByIdQuery,[req.params.id]);
}

const filterCustomers = (req, res) => {
db.runQuery(req,res,val.filterQuery,[req.params.id]);
}

const searchCustomer = (req, res) => {
var sQuery ="SELECT * from EndCustomer where channel = '"+req.params.Channel+"' and SP_ID="+req.params.spID
if(req.params.key){
sQuery = sQuery+" and (Phone_number like '%"+req.params.key+"%' or Name like '%"+req.params.key+"%')"
}

db.runQuery(req,res,sQuery,[req.params.spID,req.params.key,req.params.key]);
}

const insertCustomers = (req, res) => {
    Name= req.body.Name
    Phone_number= req.body.Phone_number
    channel= req.body.Channel
    OptInStatus= req.body.OptedIn
    SP_ID=req.body.SP_ID
    var values = [[ Name, Phone_number, channel,SP_ID, OptInStatus]]
    db.runQuery(req,res,val.insertCustomersQuery, [values])
}

const blockCustomer = (req, res) => {
    customerId= req.body.customerId
    isBlocked= req.body.isBlocked
    var values = [[ customerId, isBlocked]]
    db.runQuery(req,res,val.blockCustomerQuery, [isBlocked,customerId])
}


const createInteraction = (req, res) => {
    customerId= req.body.customerId
    interaction_status= "Open"
    interaction_details= " " 
    var values = [[ customerId, interaction_status, interaction_details]]
    db.runQuery(req,res,val.createInteractionQuery, [values])
}

const updateInteraction = (req, res) => {
    if(req.body.Status && req.body.Status!=''){
    var updateQuery = "UPDATE Interaction SET interaction_status ='"+req.body.Status+"' WHERE InteractionId ="+req.body.InteractionId
    }
    if(req.body.AutoReply && req.body.AutoReply!=''){
    
var formattedDate = new Date().toISOString();


    var updateQuery = "UPDATE Interaction SET AutoReplyStatus ='"+req.body.AutoReply+"',AutoReplyUpdatedAt ='"+formattedDate+"'  WHERE InteractionId ="+req.body.InteractionId
    }
    
    
    db.runQuery(req,res,updateQuery, [])
}

const getAllInteraction = (req, res) => {
    db.runQuery(req,res,val.getAllInteraction, [req.params.id])
}

const getInteractionById = (req, res) => {
    db.runQuery(req,res,val.selectInteractionByIdQuery, [req.params.InteractionId])
}
const checkInteractionPinned = (req, res) => {
    var queryPath = "SELECT Id FROM PinnedInteraction WHERE InteractionId=? and AgentId=?"
	db.runQuery(req,res,queryPath, [req.params.InteractionId,req.params.AgentId])
}

// filter interactions
const getFilteredInteraction = (req, res) => {
    var filterBy = req.params.filterBy
    if(filterBy == 'Open' || filterBy == 'Resolved'){
		var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer where Interaction.customerId=EndCustomer.customerId and Interaction.interaction_status='"+filterBy+"' and Interaction.InteractionId  IN (SELECT InteractionId FROM InteractionMapping where AgentId="+req.params.AgentId+")"
	}else if(filterBy ==  'Unassigned'){
		var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.customerId=EndCustomer.customerId and Interaction.InteractionId NOT IN (SELECT InteractionId FROM InteractionMapping)"
	}else if(filterBy ==  'Mine'){
		var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.customerId=EndCustomer.customerId and Interaction.InteractionId  IN (SELECT InteractionId FROM InteractionMapping where AgentId="+req.params.AgentId+")"
	}else if(filterBy ==  'Mentioned'){
		var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.customerId=EndCustomer.customerId and Interaction.InteractionId  IN (SELECT InteractionId FROM InteractionMapping)"
	}else if(filterBy ==  'Pinned'){
		var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.customerId=EndCustomer.customerId and Interaction.InteractionId  IN (SELECT InteractionId FROM PinnedInteraction where AgentId="+req.params.AgentId+")"
	}
	
    db.runQuery(req,res,queryPath, [filterBy])
}

const getSearchInteraction = (req, res) => {
    var searchKey = req.params.searchKey
    let queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.customerId=EndCustomer.customerId and EndCustomer.Name like '%"+searchKey+"%'"
     
     if(req.params.AgentId && req.params.AgentId!=''){
      queryPath  +=" and Interaction.InteractionId IN (SELECT InteractionId FROM InteractionMapping where AgentId="+req.params.AgentId
     }
     queryPath  +=" )"
     
    db.runQuery(req,res,queryPath, [searchKey])
}



const getAllMessageByInteractionId = (req, res) => {
if(req.params.Type !='media'){
var getAllMessagesByInteractionId = "SELECT Message.* ,Author.name As AgentName, DelAuthor.name As DeletedBy from Message LEFT JOIN user AS DelAuthor ON Message.Agent_id= DelAuthor.uid LEFT JOIN user AS Author ON Message.Agent_id= Author.uid where  Message.interaction_id="+req.params.InteractionId+" and Type='"+req.params.Type+"'"
db.runQuery(req,res,getAllMessagesByInteractionId, [req.params.InteractionId,req.params.Type])
}else{
var getAllMessagesByInteractionId = "SELECT * from Message where message_media != '' and interaction_id="+req.params.InteractionId+" ORDER BY Message_id DESC"

db.runQuery(req,res,getAllMessagesByInteractionId, [req.params.InteractionId,req.params.Type])

}

}

const updateMessageRead = (req, res) => {
    if(req.body.Message_id > 0){
    var messageQuery = "UPDATE Message SET is_read =1 WHERE Message_id ="+req.body.Message_id;
    var values = []
    db.runQuery(req,res,messageQuery, [values])
    }
}
const deleteMessage = (req, res) => {
    var messageQuery = "UPDATE Message SET deleted_at ='"+req.body.deleted_at+"', is_deleted ="+req.body.deleted+", deleted_by ="+req.body.deleted_by+" WHERE Message_id ="+req.body.Message_id;
    var values = []
    db.runQuery(req,res,messageQuery, [values])
}


const insertMessage = (req, res) => {

		
   if(req.body.Message_id ==''){
   var messageQuery = val.insertMessageQuery
   
    interaction_id= req.body.InteractionId
    Agent_id= req.body.AgentId
    message_direction= "Out"
    message_text= req.body.message_text
    message_media= req.body.message_media
    media_type= req.body.media_type
    Message_template_id = req.body.template_id
    Quick_reply_id =req.body.quick_reply_id
    Type = req.body.message_type
    created_at=req.body.created_at
    ExternalMessageId=''
    
    var values = [[Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,created_at]]
    db.runQuery(req,res,messageQuery, [values])
    if(req.body.message_type =='text'){
	   if(req.body.message_media!=''){
		 sendMediaOnWhatsApp(req.body.messageTo,message_media)
	   }
		 sendTextOnWhatsApp(req.body.messageTo,message_text)
    }
    
   }else{
    message_text= req.body.message_text
    Message_id= req.body.Message_id
    var values = [[message_text,Message_id]]
    var messageQuery = "UPDATE Message SET updated_at ='"+created_at+"', message_text ='"+message_text+"' WHERE Message_id ="+Message_id;
    db.runQuery(req,res,messageQuery, [values])
   }
   
   
   
   
      
      
}

const WHATSAPP_TOKEN='Bearer EAAU0g9iuku4BACBhTZCxqtq5A8rIymreLIxUQa7HaToy7PBawzooIkG73XnY1PXAUGrtCulhniRrZCsQPWOB3YcozTpT4cpgcZC5MoNB05ptdnpwAIRLLz0FtQCaLvmXNqL8qqn8Yqmf07HxVpzs6OuZClb0XOylw5DWWaMxcMJm7jzVRZCmD'
const WHATSAPPOptions = {
	  "method": "POST",
	  "hostname": 'graph.facebook.com',
	  "path": "/v16.0/101714466262650/messages",
	  "headers": {
	  	"Authorization": WHATSAPP_TOKEN,
	  	"Content-Type": "application/json",
	  }

	};
	  
function sendMediaOnWhatsApp(messageTo,mediaFile){
   var reqBH = http.request(WHATSAPPOptions, (resBH) => {
        var chunks = [];
		  resBH.on("data", function (chunk) {
			chunks.push(chunk);
		  });
        resBH.on("end", function () {
			const body = Buffer.concat(chunks);
			
		  });
	  });
      
      reqBH.write(JSON.stringify({
		"messaging_product": "whatsapp",    
    	"recipient_type": "individual",
		"to": messageTo,
		"type": "image",
        "image": { 
			"link":mediaFile
			}  
	   }));
	  reqBH.end();
	  
}

function sendTextOnWhatsApp(messageTo,messateText){
let content =messateText;
content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
		content = content.replace(/<strong[^>]*>/g, '*').replace(/<\/strong>/g, '*');
		content = content.replace(/<em[^>]*>/g, '_').replace(/<\/em>/g, '_');
		content = content.replace(/<span*[^>]*>/g, '~').replace(/<\/span>/g, '~');
		content = content.replace('&nbsp;', '\n')
		content = content.replace(/<br[^>]*>/g, '\n')
		content = content.replace(/<\/?[^>]+(>|$)/g, "")
		
   var reqBH = http.request(WHATSAPPOptions, (resBH) => {
        var chunks = [];
		  resBH.on("data", function (chunk) {
			chunks.push(chunk);
		  });
        resBH.on("end", function () {
			const body = Buffer.concat(chunks);
			
		  });
	  });
      
      reqBH.write(JSON.stringify({
		"messaging_product": "whatsapp",    
    	"recipient_type": "individual",
		"to": messageTo,
		"type": "text",
        "text": { 
			"body": content
			}  
	   }));
	  reqBH.end();
	  
}

const updateInteractionMapping = (req, res) => {
    InteractionId= req.body.InteractionId
    AgentId= req.body.AgentId
    MappedBy= req.body.MappedBy
    var values = [[ InteractionId, AgentId, MappedBy]]
    db.runQuery(req,res,val.updateInteractionMapping, [values])
}

const getInteractionMapping = (req, res) => {
    db.runQuery(req,res,val.getInteractionMapping, [req.params.InteractionId])
}


    
module.exports = { getAllAgents,getAllCustomer,insertCustomers, getCustomerById, filterCustomers, searchCustomer,blockCustomer,
createInteraction,updateInteraction,getAllInteraction,getInteractionById,getFilteredInteraction,checkInteractionPinned,getSearchInteraction,
getAllMessageByInteractionId,insertMessage,deleteMessage,updateMessageRead,
updateInteractionMapping,getInteractionMapping };






