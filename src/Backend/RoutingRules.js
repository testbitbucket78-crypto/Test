const settingVal = require('./settings/generalconstant')
const db = require('./dbhelper')
var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const moment = require('moment');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

async function isDefaultContactOwner(SP_ID,custid) {
  try {
    let contactOwnerQuery = `SELECT * FROM EndCustomer WHERE customerId =? and SP_ID=? AND uid != NULL and isDeleted !=1`;
    let contactOwner = await db.excuteQuery(contactOwnerQuery, [custid, SP_ID]);
    let mappingUid = contactOwner[0]?.uid;
    if (contactOwner?.length == 0) {
      let defaultAdminQuery = `SELECT * FROM defaultActions WHERE spid=? AND  (isDeleted is null or isDeleted =0)`;
      let defaultAdmin = await db.excuteQuery(defaultAdminQuery, [SP_ID]);
      mappingUid = defaultAdmin[0]?.defaultAdminUid
    }
    return mappingUid;
  } catch (err) {
    console.log("ERR -- isDefaultContactOwner", err)
    return undefined;
  }
}

async function AssignToContactOwner(sid, newId, agid, custid) {
  try{
  console.log("AssignToContactOwner", sid, newId, agid, custid)
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=${sid}`;

  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, []);
  console.log("RoutingRules", RoutingRules?.length)
  //let contactOwnerQuery = `SELECT * FROM EndCustomer WHERE SP_ID=? AND uid != NULL`;
  let contactOwnerUid = await isDefaultContactOwner(sid,custid) //await db.excuteQuery(contactOwnerQuery, [sid]);
 // console.log("contactOwnerUid", contactOwnerUid,"RoutingRules.length",RoutingRules?.length,RoutingRules[0].contactowner)
  if (RoutingRules.length > 0) {

    if (contactOwnerUid != undefined && RoutingRules[0].contactowner == '1') {

      let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`
      let values = [[newId, contactOwnerUid, '-1', 1]] // 2ng agid is MappedBy  values in teambox uid is used here also
      let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values])
    } else {
      assignToLastAssistedAgent(sid, newId, agid, custid)
    }
  }
}catch(err){
  console.log("ERR _ _ _ AssignToContactOwner" ,err)
}
}


async function assignToLastAssistedAgent(sid, newId, agid, custid) {
  try{
  console.log("assignToLastAssistedAgent")
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID =?`;

  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
  console.log("--------------------------", RoutingRules)



  let LastAssistedAgentQuery = `SELECT im.MappingId
  FROM InteractionMapping im
  JOIN (
    SELECT MAX(i.interactionId) AS latestInteractionId
    FROM Interaction i
    WHERE i.customerId =? AND i.interaction_status ='Resolved' 
  ) latestInteraction
  ON im.interactionId = latestInteraction.latestInteractionId and im.AgentId !=-1;`;
  let LastAssistedAgent = await db.excuteQuery(LastAssistedAgentQuery, [custid]);
  console.log(RoutingRules[0]?.broadcast == '1', LastAssistedAgent, LastAssistedAgent.length, new Date(), RoutingRules[0]?.broadcast == 1)
  if (LastAssistedAgent.length > 0 && RoutingRules[0]?.assignagent == '1') {
    console.log("if ----- LastAssistedAgent")
    let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`;
    let assignAgent = await db.excuteQuery(assignAgentQuery, [[[newId, LastAssistedAgent[0].AgentId, '-1', 1]]]);
    console.log(assignAgent)
  } else if (RoutingRules?.length > 0 && RoutingRules[0]?.broadcast == '1') {
    console.log("broadcast")
    BroadCast(sid, agid, newId)
    ManagemissedChat(sid, newId, agid, custid, RoutingRules)
  } else if (RoutingRules?.length > 0 && RoutingRules[0]?.roundrobin == '1') {
    console.log("RoundRobin")
    RoundRobin(sid, newId)
    ManagemissedChat(sid, newId, agid, custid, RoutingRules)
  } else if (RoutingRules?.length > 0 && RoutingRules[0]?.manualassign == '1') {
    console.log("ManualAssign")
    ManualAssign(newId, sid)
    ManagemissedChat(sid, newId, agid, custid, RoutingRules)
  }
}catch(err){
  console.log("ERR _ _ _ assignToLastAssistedAgent" ,err)
}
}

async function BroadCast(sid, agid, newId) {
  try{
  console.log("BroadCast")
  let myUTCString = new Date().toUTCString();
  const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
  var addNotification = `INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`
  let notifyvalues = [[sid, 'Notify Online Agents', 'New Unassign Chat is Avilable', agid, 'webhook', '-1',created_at ]]
  let notifyRes = await db.excuteQuery(addNotification, [notifyvalues])
  }catch(err){
    console.log("ERR _ _ _ BroadCast" ,err)
  }
}

async function RoundRobin(sid, newId) {
  try{
  console.log("RoundRobin")
  let activeAgentQuery = "select *from user where  IsActive=1 and SP_ID=? and isDeleted !=1 ";
  let activeAgent = await db.excuteQuery(activeAgentQuery, [sid]);

  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
  let routingData = await db.excuteQuery(RoutingRulesQuery, [sid]);
  let maxAllowd = routingData.length > 0 ? routingData[0].conversationallowed : 0;


  if (activeAgent.length > 0) {

    for (let agent of activeAgent) {

      let checkAssignInteraction = await db.excuteQuery(settingVal.checkAssignInteraction, [newId])

      if ((checkAssignInteraction.length <= 0) || (checkAssignInteraction.length > 0 && checkAssignInteraction[0]?.AgentId == -1)) {
        console.log("(checkAssignInteraction.length <= 0) || (checkAssignInteraction?.AgentId == -1)")
        let assignedChatCount = await db.excuteQuery(settingVal.assignCount, [agent.uid, sid])

        let chatCount = assignedChatCount.length > 0 ? assignedChatCount[0].count : 0;

        if (maxAllowd > chatCount) {
          let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`
          let chatAssigend = db.excuteQuery(assignAgentQuery, [[[newId, agent.uid, '-1', 1]]]);

        }
      }
    }
  }
}catch(err){
  console.log("ERR _ _ _ RoundRobin" ,err)
}

}

async function ManualAssign(sid, newId) {
  try{
  console.log("ManualAssign")
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
  if (RoutingRules.length > 0) {
    let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES (?,?,?,?)`;
    let assignAgentRes = await db.excuteQuery(assignAgentQuery, [newId, RoutingRules[0].manualAssignUid, '-1', 1]);

  }
}catch(err){
  console.log("ERR _ _ _ ManualAssign" ,err)
}
}

async function ManagemissedChat(sid, newId, agid, custid, RoutingRules) {
  try{
  console.log("ManagemissedChat", new Date())
  let checkAssignInteraction = await db.excuteQuery(settingVal.checkAssignInteraction, [newId])
  console.log("checkAssignInteraction.length", checkAssignInteraction.length)
  if ((checkAssignInteraction.length <= 0) || (checkAssignInteraction.length > 0 && checkAssignInteraction[0]?.AgentId == -1)) {
    console.log("missed -------------------")
    let time = (RoutingRules[0].timeoutperiod).replace(/\s*(Min|hour)/g, '')
    console.log("missed chat time", time)
    // Perform operation based on RoutingRules and timeout period
    let performOperation =
      RoutingRules[0].isMissChatAssigContactOwner === 1
        ? () => AssignMissedToContactOwner(sid, newId, agid, custid)
        : RoutingRules[0].assignspecificuser === 1
          ? () => AssignSpecificUser(sid, newId)
          : RoutingRules[0].isadmin === 1
            ? () => AssignAdmin(newId, sid)
            : () => AssignAdmin(newId, sid);

    // Set timeout to perform operation after the specified time period
    setTimeout(performOperation, time * 60 * 1000); // Multiplying time by 60 to convert minutes to milliseconds
  }
}catch(err){
  console.log("ERR _ _ _ ManagemissedChat" ,err)
}
}

async function AssignAdmin(newId, sid) {
  try{
  console.log("AssignAdmin")
  let selectAdminUid = `SELECT * FROM routingrules WHERE SP_ID=?`;
  let selectAdmin = await db.excuteQuery(selectAdminUid, [sid]);
  let admin =  selectAdmin[0]?.adminUid;
  if (selectAdmin?.length == 0) {
    let defaultAdminQuery = `SELECT * FROM defaultActions WHERE spid=? AND  (isDeleted is null or isDeleted =0)`;
    let defaultAdmin = await db.excuteQuery(defaultAdminQuery, [sid]);
    admin = defaultAdmin[0]?.defaultAdminUid
  }
  let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`;
  let assignAgentRes = await db.excuteQuery(assignAgentQuery, [[[newId, admin, '-1', 1]]]);
  }catch(err){
    console.log("ERR _ _ _ AssignAdmin ManagemissedChat" ,err)
  }
}

async function AssignSpecificUser(sid, newId) {
  try{
  console.log("AssignSpecificUser")
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
  if (RoutingRules.length > 0) {
    let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES (?,?,?,?)`;
    let assignAgentRes = await db.excuteQuery(assignAgentQuery, [newId, RoutingRules[0].SpecificUserUid, '-1', 1]);

  }
}catch(err){
  console.log("ERR _ _ _ AssignSpecificUser ManagemissedChat" ,err)
}
}

async function AssignMissedToContactOwner(sid, newId, agid, custid) {
  try{
  console.log("AssignMissedToContactOwner")
  // let contactOwnerQuery = `SELECT * FROM EndCustomer WHERE SP_ID=? AND uid != NULL`;
  // let contactOwner = await db.excuteQuery(contactOwnerQuery, [sid]);
  let contactOwnerUid = await isDefaultContactOwner(sid,custid) ;
  console.log("contactOwnerUid", contactOwnerUid)
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID =?`;

  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
  if (RoutingRules?.length > 0) {

    if (contactOwnerUid != undefined && RoutingRules[0].contactowner == '1') {

      let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`
      let values = [[newId, contactOwnerUid, '-1', 1]] // 2ng agid is MappedBy  values in teambox uid is used here also
      let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values])
    // } else if (RoutingRules[0].assignagent == '1') {   // Here I have to add condition if contact owner not the find from defaultaction tables default admin and assign to him
    //   assignToLastAssistedAgent(sid, newId, agid, custid)
     }
  }
}catch(err){
    console.log("ERR _ _ _ AssignMissedToContactOwner ManagemissedChat" ,err)
  }
}


module.exports = { RoundRobin, ManualAssign, assignToLastAssistedAgent, AssignToContactOwner }