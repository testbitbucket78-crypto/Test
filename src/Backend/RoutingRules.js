const settingVal = require('./settings/generalconstant')
const db = require('./dbhelper')
var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


async function AssignToContactOwner(sid, newId, agid, custid) {
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=${sid}`;

  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, []);

  let contactOwnerQuery = `SELECT * FROM EndCustomer WHERE SP_ID=? AND uid != NULL`;
  let contactOwner = await db.excuteQuery(contactOwnerQuery, [sid]);

  if (RoutingRules.length > 0) {

    if (contactOwner.length > 0 && RoutingRules[0].contactowner == '1') {

      let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`
      let values = [[newId, agid, '-1', 1]] // 2ng agid is MappedBy  values in teambox uid is used here also
      let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values])
    } else if (RoutingRules[0].assignagent == '1') {
      assignToLastAssistedAgent(newId, custid)
    }
  }
}


async function assignToLastAssistedAgent(sid, newId, agid, custid) {
  console.log("assignToLastAssistedAgent")
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=${sid}`;

  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, []);




  let LastAssistedAgentQuery = `SELECT im.MappingId
  FROM InteractionMapping im
  JOIN (
    SELECT MAX(i.interactionId) AS latestInteractionId
    FROM Interaction i
    WHERE i.customerId =? AND i.interaction_status ='Resolved' 
  ) latestInteraction
  ON im.interactionId = latestInteraction.latestInteractionId;`;
  let LastAssistedAgent = await db.excuteQuery(LastAssistedAgentQuery, [custid]);
  if (LastAssistedAgent.length > 0) {
    let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`;
    let assignAgent = await db.excuteQuery(assignAgentQuery, [[[newId, LastAssistedAgent[0].AgentId, '-1', 1]]]);
    console.log(assignAgent)
  }else if (RoutingRules.length > 0 && RoutingRules[0].broadcast == '1') {
    BroadCast(sid,agid,newId)
    ManagemissedChat(sid, newId, agid, custid,RoutingRules)
  }else if (RoutingRules.length > 0 && RoutingRules[0].roundrobin == '1') {
    RoundRobin(sid, newId)
    ManagemissedChat(sid, newId, agid, custid,RoutingRules)
  } else if (RoutingRules.length > 0 && RoutingRules[0].manualassign == '1') {
    ManualAssign(newId, sid)
    ManagemissedChat(sid, newId, agid, custid,RoutingRules)
  }
}

async function BroadCast(sid,agid, newId){
  console.log("BroadCast")
  var addNotification = `INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`
  let notifyvalues = [[sid,'Notify Online Agents', 'New Unassign Chat is Avilable', agid, 'webhook', '-1', new Date()]]
  let notifyRes = await db.excuteQuery(addNotification, [notifyvalues])
}

async function RoundRobin(sid, newId) {
  console.log("RoundRobin")
  let activeAgentQuery = "select *from user where  IsActive=1 and SP_ID=?";
  let activeAgent = await db.excuteQuery(activeAgentQuery, [sid]);
 
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
  let routingData = await db.excuteQuery(RoutingRulesQuery, [sid]);
  let maxAllowd = routingData.length > 0 ? routingData[0].conversationallowed : 0;

 
  if (activeAgent.length > 0) {

    for (let agent of activeAgent) {
   
      let checkAssignInteraction = await db.excuteQuery(settingVal.checkAssignInteraction, [newId])
      if (checkAssignInteraction.length <= 0) {
        let assignedChatCount = await db.excuteQuery(settingVal.assignCount, [agent.uid, sid])
    
        let chatCount = assignedChatCount.length > 0 ? assignedChatCount[0].count : 0;
    
        if (maxAllowd > chatCount) {
          let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`
          let chatAssigend = db.excuteQuery(assignAgentQuery, [[[newId, agent.uid, '-1', 1]]]);
     
        }
      }
    }
  }


}

async function ManualAssign(sid, newId) {
  console.log("ManualAssign")
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
  if (RoutingRules.length > 0) {
    let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`;
    let assignAgentRes = await db.excuteQuery(assignAgentQuery, [newId, RoutingRules[0].manualAssignUid, '-1', 1]);
  
  }
}

async function ManagemissedChat(sid, newId, agid, custid,RoutingRules){
  console.log("ManagemissedChat")
  let checkAssignInteraction = await db.excuteQuery(settingVal.checkAssignInteraction, [newId])
  if (checkAssignInteraction.length <= 0) {
  let time = (RoutingRules[0].timeoutperiod).replace(/\s*(Min|hour)/g, '')
  //we have to select timeoutperiod from Roting Rules then call missed chat which is enable
  
  let performOperation =
  RoutingRules[0].isMissChatAssigContactOwner === 1
    ? AssignMissedToContactOwner(sid, newId, agid, custid)
    : RoutingRules[0].assignspecificuser === 1
    ? AssignSpecificUser(sid, newId)
    : RoutingRules[0].isadmin === 1
    ? AssignAdmin(newId, sid)
    : AssignAdmin(newId, sid);


  setTimeout(performOperation, time * 1000);
  }
}

async function AssignAdmin(newId, sid) {
  console.log("AssignAdmin")
  let selectAdminUid = `SELECT uid from user where UserType=1 and SP_ID=?`;
  let selectAdmin = await db.excuteQuery(selectAdminUid, [sid]);
  let admin = selectAdmin.length > 0 ? selectAdmin[0].uid : 0;
  let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`;
  let assignAgentRes = await db.excuteQuery(assignAgentQuery, [newId, admin, '-1', 1]);
}

async function AssignSpecificUser(sid, newId) {
  console.log("AssignSpecificUser")
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
  if (RoutingRules.length > 0) {
    let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`;
    let assignAgentRes = await db.excuteQuery(assignAgentQuery, [newId, RoutingRules[0].SpecificUserUid, '-1', 1]);
 
  }
}

async function AssignMissedToContactOwner(sid, newId, agid, custid) {
console.log("AssignMissedToContactOwner")
  let contactOwnerQuery = `SELECT * FROM EndCustomer WHERE SP_ID=? AND uid != NULL`;
  let contactOwner = await db.excuteQuery(contactOwnerQuery, [sid]);

  if (RoutingRules.length > 0) {

    if (contactOwner.length > 0 && RoutingRules[0].contactowner == '1') {

      let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`
      let values = [[newId, agid, '-1', 1]] // 2ng agid is MappedBy  values in teambox uid is used here also
      let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values])
    } else if (RoutingRules[0].assignagent == '1') {   // Here I have to add condition if contact owner not the find from defaultaction tables default admin and assign to him
      assignToLastAssistedAgent(newId, custid)
    }
  }
}


module.exports = { RoundRobin, ManualAssign, assignToLastAssistedAgent, AssignToContactOwner }