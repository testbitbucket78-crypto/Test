const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const http = require("https");
const middleWare=require('../middleWare')

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


const getCampaigns = (req, res) => {
let Query ="SELECT * from Campaign  where  Campaign.is_deleted =0 and Campaign.sp_id="+req.body.SPID
if(req.body.key){
Query += sQuery+" and  Campaign.title like '%"+req.body.key+"%'"
}
console.log(Query)
db.runQuery(req,res,Query,[]);
}


const addCampaign = (req, res) => {
	if(req.body.Id!=''){
		var updateQuery = "UPDATE Campaign set";
		 updateQuery += " title='"+req.body.title+"',";
		 updateQuery += " channel_id='"+req.body.channel_id+"',";
		 updateQuery += " message_heading='"+req.body.message_heading+"',";
		 updateQuery += " message_content='"+req.body.message_content+"',";
		 updateQuery += " message_media='"+req.body.message_media+"',";
		 updateQuery += " message_variables='"+req.body.message_variables+"',";
		 updateQuery += " button_yes='"+req.body.button_yes+"',";
		 updateQuery += " button_no='"+req.body.button_no+"',";
		 updateQuery += " button_exp='"+req.body.button_exp+"',";
		 updateQuery += " category='"+req.body.category+"',";
		 updateQuery += " time_zone='"+req.body.time_zone+"',";
		 updateQuery += " start_datetime='"+req.body.start_datetime+"',";
		 updateQuery += " end_datetime='"+req.body.end_datetime+"',";
		 updateQuery += " csv_contacts='"+req.body.csv_contacts+"',";
		 updateQuery += " segments_contacts='"+req.body.segments_contacts+"',";
		 updateQuery += " status= "+req.body.status;
		 updateQuery +=" WHERE Id ="+req.body.Id
		 
		 db.runQuery(req,res,updateQuery,[]);
	}else{
		var inserQuery = "INSERT INTO Campaign (status,sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,start_datetime,end_datetime,csv_contacts,segments_contacts) ";
		inserQuery +="VALUES ("+req.body.status+","+req.body.sp_id+",'"+req.body.title+"','" + req.body.channel_id + "','" + req.body.message_heading + "','"+req.body.message_content+"','"+req.body.message_media+"','"+req.body.message_variables+"','"+req.body.button_yes+"','"+req.body.button_no+"','"+req.body.button_exp+"','"+req.body.category+"','"+req.body.time_zone+"','"+req.body.start_datetime+"','"+req.body.end_datetime+"','"+req.body.csv_contacts+"','"+req.body.segments_contacts+"')";
		
		db.runQuery(req,res,inserQuery,[]);
	}
}


const getCampaignDetail = (req, res) => {
let Query ="SELECT * from Campaign  where  Campaign.Id="+req.params.CampaignId
db.runQuery(req,res,Query,[]);
}


const getFilteredCampaign = (req, res) => {
let filterQuery ="SELECT * from Campaign  where Campaign.is_deleted =0 and Campaign.sp_id="+req.body.SPID
if(req.body.start_date){
filterQuery += " and  start_datetime >= '"+req.body.start_date+"'"
}

if(req.body.end_date){
filterQuery += " and  end_datetime <= '"+req.body.end_date+"'"
}
if(req.body.channelIn.length>0){
filterQuery += " and  channel_id IN ("+req.body.channelIn+")"
}

if(req.body.categoryIn.length>0){
filterQuery += " and  category_id IN ("+req.body.categoryIn+")"
}

if(req.body.statusIn.length>0){
filterQuery += " and  status IN ("+req.body.statusIn+")"
}

if(req.body.key){
filterQuery += " and  title like '%"+req.body.key+"%'"
}

console.log(filterQuery)
db.runQuery(req,res,filterQuery,[]);
}


const getContactList= (req, res) => {
let Query ="SELECT ContactList.* ,user.name as owner from ContactList,user  where user.uid =ContactList.created_by and  ContactList.SP_id = "+req.body.SPID
if(req.body.key){
Query += " and  ContactList.list_name like '%"+req.body.key+"%'"
}

console.log(Query)
db.runQuery(req,res,Query,[]);
}

const updatedContactList= (req, res) => {

var updateQueryQuery = "UPDATE ContactList SET filters ='" + req.body.filters + "',"; 
    updateQueryQuery +=" contact_id_list ='"+req.body.contact_id_list+"',"
    updateQueryQuery +=" updated_at ='"+new Date().toISOString().slice(0, 19).replace('T', ' ')+"'"
    
    updateQueryQuery +=" WHERE Id ="+req.body.Id
    
    db.runQuery(req,res,updateQueryQuery, [])
    
    

}

const addNewContactList= (req, res) => {
var inserQuery = "INSERT INTO ContactList (SP_id,created_by,filters,contact_id_list,list_name) VALUES ("+req.body.SP_id+","+req.body.created_by+",'" + req.body.filters + "','" + req.body.contact_id_list + "','"+req.body.list_name+"')";
db.runQuery(req,res,inserQuery,[]);
}

const applyFilterOnEndCustomer= (req, res) => {

  db.runQuery(req,res,req.body.Query,[]);
}

const getAdditiionalAttributes= (req, res) => {
let Query ="SELECT * from sip_attributes  where SP_id = "+req.params.SPID
db.runQuery(req,res,Query,[]);
}

const deleteCampaign =(req, res) => {
var updateQueryQuery = "UPDATE Campaign SET is_deleted =1 WHERE Id ="+req.params.CampaignId

    db.runQuery(req,res,updateQueryQuery, [])
}

const getEndCustomerDetail=(req, res) =>{
let Query ="SELECT * from EndCustomer  where customerId = "+req.params.customerId

db.runQuery(req,res,Query,[]);
}

const getContactAttributesByCustomer=(req, res) =>{
let Query ="SELECT * from ContactAttributes where EndCustomerId = "+req.params.customerId

db.runQuery(req,res,Query,[]);
}


const sendCampinMessage= (req, res) => {
    console.log("sendCampinMessage")
var TemplateData = req.body
console.log(TemplateData)
let messageData='';
var messageTo= TemplateData.phone_number
var messateText = TemplateData.message_content
let content =messateText;
let channel=TemplateData.channel_label
console.log("channel");
console.log(channel)
console.log("content")
console.log(content)
content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
content = content.replace(/<strong[^>]*>/g, '*').replace(/<\/strong>/g, '*');
content = content.replace(/<em[^>]*>/g, '_').replace(/<\/em>/g, '_');
content = content.replace(/<span*[^>]*>/g, '~').replace(/<\/span>/g, '~');
content = content.replace('&nbsp;', '\n')
content = content.replace(/<br[^>]*>/g, '\n')
content = content.replace(/<\/?[^>]+(>|$)/g, "")
middleWare.channelssetUp(channel,'text',messageTo,content)
	//    var reqBH = http.request(WHATSAPPOptions, (resBH) => {
    //     var chunks = [];
	// 	  resBH.on("data", function (chunk) {
	// 		chunks.push(chunk);
	// 	  });
    //     resBH.on("end", function () {
	// 		const body = Buffer.concat(chunks);
	// 		 return res.send(body.toString());
	// 	  });
	//   });
      
      
    //   reqBH.write(JSON.stringify({
	// 	"messaging_product": "whatsapp",    
    // 	"recipient_type": "individual",
	// 	"to": messageTo,
	// 	"type": "text",
    //     "text": { 
	// 		"body": content
	// 		}  
	//    }));
	  
	  /* 
	  reqBH.write(JSON.stringify({
   "messaging_product": "whatsapp",
   "to": messageTo,
   "type": "template",
   "template": {
       "name": "hello_world",
       "language": {
           "code": "en_US",
           "policy": "deterministic"
       },
       "components": [
           {
               "type": "body",
               "parameters": [
                   {
                       "type": "text",
                       "text": content
                   }
               ]
           },
           {
               "type": "button",
               "sub_type": "quick_reply",
               "index": 0,
               "parameters": [
                   {
                       "type": "text",
                       "text": "Yes"
                   }
               ]
           },
           {
               "type": "button",
               "sub_type": "quick_reply",
               "index": 1,
               "parameters": [
                   {
                       "type": "text",
                       "text": "No"
                   }
               ]
           }
       ]
   }
 }));

*/
	  //reqBH.end();
	
}


const saveCampaignMessages= (req, res) => {

var inserQuery = "INSERT INTO CampaignMessages (status_message,button_yes,button_no,button_exp,message_media,message_content,message_heading,CampaignId,phone_number,status,schedule_datetime)";
inserQuery += " VALUES ('"+req.body.status_message+"','"+req.body.button_yes+"','"+req.body.button_no+"','" + req.body.button_exp + "','" + req.body.message_media + "','"+req.body.message_content+"','"+req.body.message_heading+"',"+req.body.CampaignId+",'"+req.body.phone_number+"',"+req.body.status+",'"+req.body.schedule_datetime+"')";
db.runQuery(req,res,inserQuery,[]);

}


const WHATSAPP_TOKEN='Bearer EAAD3Jp4D3lIBABUpzqZCpd8JxKT9aBjEmU1dGGxYFZBVcrbve6NtdiGpKwTb8EuthKEYKjU44dxgKuxZCZA3gXJEquZBwRUhC8en0s42JYdZCKknbzxeY54wvBZCrx3GKfFd33o5lykgZCJGtiZCUT3pw2IQOLTQ8EVTrT33ll3Nwm4Xl0caAF66DFxSxHakWpTRDKTXcHCPytPhuyaTMtnog'
const WHATSAPPOptions = {
	  "method": "POST",
	  "hostname": 'graph.facebook.com',
	  "path": "/v15.0/102711876156078/messages",
	  "headers": {
	  	"Authorization": WHATSAPP_TOKEN,
	  	"Content-Type": "application/json",
	  }
};

const getCampaignMessages=(req, res) =>{
let Query ="SELECT * from CampaignMessages  where CampaignId = "+req.params.CampaignId

db.runQuery(req,res,Query,[]);
}


const copyCampaign=(req, res) =>{
let Query ="SELECT * from CampaignMessages  where CampaignId = "+req.params.CampaignId

let CopyQuery ="INSERT INTO Campaign (sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,start_datetime,end_datetime,csv_contacts,segments_contacts) SELECT sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,start_datetime,end_datetime,csv_contacts,segments_contacts FROM Campaign WHERE Id = "+req.params.CampaignId

console.log(CopyQuery)
db.runQuery(req,res,CopyQuery,[]);
}
	
module.exports = {copyCampaign,getCampaignMessages,sendCampinMessage,saveCampaignMessages,getContactAttributesByCustomer,getEndCustomerDetail,getAdditiionalAttributes,deleteCampaign,addCampaign,getCampaigns,getCampaignDetail,getFilteredCampaign,getContactList,updatedContactList,addNewContactList,applyFilterOnEndCustomer};






