const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const val=require('./TeamBoxConstant')
const app = express();
const bcrypt = require('bcrypt');
const http = require("https");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

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
db.runQuery(req,res,val.searchQuery,[req.params.key,req.params.key]);
}

const insertCustomers = (req, res) => {
    Name= req.body.Name
    Phone_number= req.body.Phone_number
    channel= req.body.Channel
    OptInStatus= req.body.OptedIn
    var values = [[ Name, Phone_number, channel,OptInStatus]]
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
    
    
    console.log(updateQuery)
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
     
     console.log(queryPath)
	db.runQuery(req,res,queryPath, [searchKey])
}



const getAllMessageByInteractionId = (req, res) => {
    db.runQuery(req,res,val.getAllMessagesByInteractionId, [req.params.InteractionId,req.params.Type])
}

const updateMessageRead = (req, res) => {
    var messageQuery = "UPDATE Message SET is_read =1 WHERE Message_id ="+req.body.Message_id;
    var values = []
    db.runQuery(req,res,messageQuery, [values])
}
const deleteMessage = (req, res) => {
    var messageQuery = "UPDATE Message SET is_deleted ="+req.body.deleted+", deleted_by ="+req.body.deleted_by+" WHERE Message_id ="+req.body.Message_id;
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
    Message_template_id = ' '
    Quick_reply_id =req.body.quick_reply_id
    Type = req.body.message_type
    ExternalMessageId=''
    var values = [[Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,Message_template_id,Quick_reply_id]]
    
    
   }else{
    message_text= req.body.message_text
    Message_id= req.body.Message_id
    var values = [[message_text,Message_id]]
    var messageQuery = "UPDATE Message SET message_text ='"+message_text+"' WHERE Message_id ="+Message_id;
   }
   db.runQuery(req,res,messageQuery, [values])
   
   if(req.body.message_type =='text'){
    var options = {
	  "method": "POST",
	  "hostname": 'graph.facebook.com',
	  "path": "/v15.0/116650038030003/messages",
	  "headers": {
	  	"Authorization": `Bearer EAABx7u3iFZBYBAJZBnZCmklY1s5uZC5120NfeEnGMkKj9GGYfEKeOVKzD2ZCguRyluWs5UifG0TIirp068IZCq1NUGZAZCxdZA4AIZBBC7oIZBOS4xYtTnqhUjlA1k8vuEhhZCD0ZBcvXVDz2J1Dhk6IXZCdeuAOZBqCaZBM2vZCZBEdHSEPGeN4dWPZCrrSnLoutf66vKSPkwHdbuv3U3T9gZDZD`,
       	"Content-Type": "application/json",
	  }

	};
	
    var reqBH = http.request(options, (resBH) => {
        var chunks = [];
		  resBH.on("data", function (chunk) {
			chunks.push(chunk);
		  });
        resBH.on("end", function () {
			const body = Buffer.concat(chunks);
			console.log(body.toString())
		  });
	  });
      
      reqBH.write(JSON.stringify({
		"messaging_product": "whatsapp",    
    	"recipient_type": "individual",
		"to": req.body.messageTo,
		"text": {
			"body": req.body.message_text
		}
	  
	  }));
		
      reqBH.end();
      
      }
      
      
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






