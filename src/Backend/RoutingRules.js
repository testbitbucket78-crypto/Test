const settingVal = require('./settings/generalconstant')
const db = require('./dbhelper')
var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


async function AssignToContactOwner(sid, newId, agid,custid) {
//   console.log("contactOwner[0].Name")
//  console.log( sid, newId, agid,custid)
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=${sid}`;

  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, []);
  // console.log(RoutingRules)
  let contactOwnerQuery = `SELECT * FROM EndCustomer WHERE SP_ID=? AND uid != NULL`;
  let contactOwner = await db.excuteQuery(contactOwnerQuery, [sid]);

  if (RoutingRules.length > 0) {

    if (contactOwner.length > 0 && RoutingRules[0].contactowner == '1') {
    
      let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`
      let values = [[newId, agid, '-1', 1]] // 2ng agid is MappedBy  values in teambox uid is used here also
      let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values])
    } else if (RoutingRules[0].assignagent == '1') {
      assignToLastAssistedAgent(newId,custid)
    }
  }
}


async function assignToLastAssistedAgent(sid,newId, custid) {

  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=${sid}`;

  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, []);
  // console.log(RoutingRules)


  
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
  }else if(RoutingRules.length > 0 && RoutingRules[0].roundrobin=='1'){
    RoundRobin(sid,newId)
  }else if(RoutingRules.length > 0 && RoutingRules[0].manualassign== '1'){
    ManualAssign(newId,sid)
  }
}


async function RoundRobin(sid, newId) {
  let activeAgentQuery = "select *from user where  IsActive=1 and SP_ID=?";
  let activeAgent = await db.excuteQuery(activeAgentQuery, [sid]);
  // console.log(activeAgent)
  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
  let routingData = await db.excuteQuery(RoutingRulesQuery, [sid]);
  let maxAllowd = routingData.length > 0 ? routingData[0].conversationallowed : 0;

  // console.log(maxAllowd)
  // console.log(routingData)
  if (activeAgent.length > 0) {
    // console.log("agent.name")
    for (let agent of activeAgent) {
      // console.log(agent.uid)
      let checkAssignInteraction = await db.excuteQuery(settingVal.checkAssignInteraction, [newId])
      if (checkAssignInteraction.length <= 0) {
        let assignedChatCount = await db.excuteQuery(settingVal.assignCount, [agent.uid, sid])
        // console.log(assignedChatCount)
        let chatCount = assignedChatCount.length > 0 ? assignedChatCount[0].count : 0;
        // console.log(chatCount);
        // console.log(maxAllowd > chatCount)
        if (maxAllowd > chatCount) {
          let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`
          let chatAssigend = db.excuteQuery(assignAgentQuery, [[[newId, agent.uid, '-1', 1]]]);
          // console.log(chatAssigend)
        }
      }
    }
  }


}

async function ManualAssign(sid,newId) {

  let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
  let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
  if (RoutingRules.length > 0) {
    let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy,is_active) VALUES ?`;
    let assignAgentRes = await db.excuteQuery(assignAgentQuery, [newId, RoutingRules[0].manualAssignUid, '-1', 1]);
    // console.log("assignAgentRes")
    // console.log(assignAgentRes)
  }
}

// app.post('/route', async (req, res) => {
//   let routingrules = await AssignToContactOwner(2, 799 ,2 ,712);
//   console.log("routingrules")
//   res.send(200)
// })
// app.listen(3000, () => {
//   console.log('Server is running on port ' + 3000);
// });
module.exports = { RoundRobin,ManualAssign, assignToLastAssistedAgent,AssignToContactOwner}