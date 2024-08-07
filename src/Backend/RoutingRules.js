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
  try {
    console.log("AssignToContactOwner", sid, newId, agid, custid);
    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=${sid}`;
    let RoutingRules = await db.excuteQuery(RoutingRulesQuery, []);
    console.log("RoutingRules", RoutingRules?.length);
    let contactOwnerUid = await isDefaultContactOwner(sid, custid);

    if (RoutingRules.length > 0) {
      if (contactOwnerUid != undefined && RoutingRules[0].contactowner == '1') {
        let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
        let values = [[newId, contactOwnerUid, '-1', 1]]; // 2nd agid is MappedBy values in teambox uid is used here also
        let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values]);
        console.log("AssignToContactOwner --- contact owner assign", updateInteractionMap);
        if (updateInteractionMap.affectedRows > 0) {
          return true; // Return true if insertion is successful
        } else {
          return { message: "Insertion into InteractionMapping failed" };
        }
      } else {
        let result = await assignToLastAssistedAgent(sid, newId, agid, custid);
        return result; // Return the result from assignToLastAssistedAgent
      }
    } else {
      return { message: "No routing rules found" }; // Return a meaningful message if no routing rules
    }
  } catch (err) {
    console.log("ERR _ _ _ AssignToContactOwner", err);
    return { error: err.message }; // Return the error message
  }
}



async function assignToLastAssistedAgent(sid, newId, agid, custid) {
  try {
    console.log("assignToLastAssistedAgent");
    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID =?`;
    let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
    //console.log("--------------------------", RoutingRules);

    let LastAssistedAgentQuery = `SELECT im.MappingId
      FROM InteractionMapping im
      JOIN (
        SELECT MAX(i.interactionId) AS latestInteractionId
        FROM Interaction i
        WHERE i.customerId =? AND i.interaction_status ='Resolved'
      ) latestInteraction
      ON im.interactionId = latestInteraction.latestInteractionId and im.AgentId !=-1;`;
    let LastAssistedAgent = await db.excuteQuery(LastAssistedAgentQuery, [custid]);
    console.log(RoutingRules[0]?.broadcast == '1', LastAssistedAgent, LastAssistedAgent.length, new Date(), RoutingRules[0]?.broadcast == 1);

    if (LastAssistedAgent.length > 0 && RoutingRules[0]?.assignagent == '1') {
      console.log("if ----- LastAssistedAgent");
      let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
      let assignAgent = await db.excuteQuery(assignAgentQuery, [[[newId, LastAssistedAgent[0].AgentId, '-1', 1]]]);
      console.log("LastAssistedAgent", assignAgent);
      if (assignAgent.affectedRows > 0) {
        return true; // Return true if insertion is successful
      } else {
        return { message: "Insertion into InteractionMapping failed" };
      }
    } else if (RoutingRules?.length > 0 && RoutingRules[0]?.broadcast == '1') {
      console.log("broadcast");
      let result = await BroadCast(sid, agid, newId);
      await ManagemissedChat(sid, newId, agid, custid, RoutingRules);
      return result; // Return the result from BroadCast
    } else if (RoutingRules?.length > 0 && RoutingRules[0]?.roundrobin == '1') {
      console.log("RoundRobin");
      let result = await RoundRobin(sid, newId);
      await ManagemissedChat(sid, newId, agid, custid, RoutingRules);
      return result; // Return the result from RoundRobin
    } else if (RoutingRules?.length > 0 && RoutingRules[0]?.manualassign == '1') {
      console.log("ManualAssign");
      let result = await ManualAssign(newId, sid);
      await ManagemissedChat(sid, newId, agid, custid, RoutingRules);
      return result; // Return the result from ManualAssign
    }
  } catch (err) {
    console.log("ERR _ _ _ assignToLastAssistedAgent", err);
    return { error: err.message }; // Return the error message
  }
}


async function BroadCast(sid, agid, newId) {
  try {
    console.log("BroadCast");
    let myUTCString = new Date().toUTCString();
    const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    var addNotification = `INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`;
    let notifyvalues = [[sid, 'Notify Online Agents', 'New Unassign Chat is Avilable', agid, 'webhook', '-1', created_at]];
    let notifyRes = await db.excuteQuery(addNotification, [notifyvalues]);
    return 'broadcast'; // Return the result of the query
  } catch (err) {
    console.log("ERR _ _ _ BroadCast", err);
    return { error: err.message }; // Return the error message
  }
}


async function RoundRobin(sid, newId) {
  try {
    console.log("RoundRobin");
    let activeAgentQuery = "select *from user where IsActive=1 and SP_ID=? and isDeleted !=1 ";
    let activeAgent = await db.excuteQuery(activeAgentQuery, [sid]);

    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
    let routingData = await db.excuteQuery(RoutingRulesQuery, [sid]);
    let maxAllowd = routingData.length > 0 ? routingData[0].conversationallowed : 0;

    if (activeAgent.length > 0) {
      for (let agent of activeAgent) {
        let checkAssignInteraction = await db.excuteQuery(settingVal.checkAssignInteraction, [newId]);

        if ((checkAssignInteraction.length <= 0) || (checkAssignInteraction.length > 0 && checkAssignInteraction[0]?.AgentId == -1)) {
          console.log("(checkAssignInteraction.length <= 0) || (checkAssignInteraction?.AgentId == -1)");
          let assignedChatCount = await db.excuteQuery(settingVal.assignCount, [agent.uid, sid]);

          let chatCount = assignedChatCount.length > 0 ? assignedChatCount[0].count : 0;

          if (maxAllowd > chatCount) {
            let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
            let chatAssigend = await db.excuteQuery(assignAgentQuery, [[[newId, agent.uid, '-1', 1]]]);
            console.log("RoundRobin", chatAssigend);
            if (chatAssigend.affectedRows > 0) {
              return true; // Return true if insertion is successful
            } else {
              return { message: "Insertion into InteractionMapping failed" };
            }
          }
        }
      }
    }
  } catch (err) {
    console.log("ERR _ _ _ RoundRobin", err);
    return { error: err.message }; // Return the error message
  }
}


async function ManualAssign(newId, sid) {
  try {
    console.log("ManualAssign");
    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
    let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
    if (RoutingRules?.length > 0) {
      let newAssignQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
      let assignvalues = [[newId, '-1', '-1', 1]];
      let assignRes = await db.excuteQuery(newAssignQuery, [assignvalues]);
      if (assignRes.affectedRows > 0) {
        return true; // Return true if insertion is successful
      } else {
        return { message: "Insertion into InteractionMapping failed" };
      }
    } else {
      return { message: "No routing rules found" }; // Return a meaningful message if no routing rules
    }
  } catch (err) {
    console.log("ERR _ _ _ ManualAssign", err);
    return { error: err.message }; // Return the error message
  }
}


async function ManagemissedChat(sid, newId, agid, custid, RoutingRules) {
  try {
    console.log("ManagemissedChat", new Date());
    let checkAssignInteraction = await db.excuteQuery(settingVal.checkAssignInteraction, [newId]);
    console.log("checkAssignInteraction.length", checkAssignInteraction.length);
    if ((checkAssignInteraction.length <= 0) || (checkAssignInteraction.length > 0 && checkAssignInteraction[0]?.AgentId == -1)) {
      console.log("missed -------------------");
      let time = (RoutingRules[0].timeoutperiod).replace(/\s*(Min|hour)/g, '');
      console.log("missed chat time", time);

      // Perform operation based on RoutingRules and timeout period
      let performOperation =
        RoutingRules[0].isMissChatAssigContactOwner === 1
          ? async () => await AssignMissedToContactOwner(sid, newId, agid, custid)
          : RoutingRules[0].assignspecificuser === 1
            ? async () => await AssignSpecificUser(sid, newId)
            : RoutingRules[0].isadmin === 1
              ? async () => await AssignAdmin(newId, sid)
              : async () => await AssignAdmin(newId, sid);

      // Set timeout to perform operation after the specified time period
      setTimeout(async () => {
        let result = await performOperation();
        if (result === true) {
          console.log("Operation successful");
        } else {
          console.log("Operation failed", result);
        }
      }, time * 60 * 1000); // Multiplying time by 60 to convert minutes to milliseconds

      return true;
    }
  } catch (err) {
    console.log("ERR _ _ _ ManagemissedChat", err);
    return { error: err.message }; // Return the error message
  }
}

async function AssignAdmin(newId, sid) {
  try {
    console.log("AssignAdmin");
    let selectAdminUid = `SELECT * FROM routingrules WHERE SP_ID=?`;
    let selectAdmin = await db.excuteQuery(selectAdminUid, [sid]);
    let admin = selectAdmin[0]?.adminUid;
    if (selectAdmin?.length == 0) {
      let defaultAdminQuery = `SELECT * FROM defaultActions WHERE spid=? AND (isDeleted is null or isDeleted = 0)`;
      let defaultAdmin = await db.excuteQuery(defaultAdminQuery, [sid]);
      admin = defaultAdmin[0]?.defaultAdminUid;
    }
    let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
    let assignAgentRes = await db.excuteQuery(assignAgentQuery, [[[newId, admin, '-1', 1]]]);
    console.log("AssignAdmin", assignAgentRes);
    if (assignAgentRes.affectedRows > 0) {
      return true;
    } else {
      return { message: "Insertion into InteractionMapping failed" };
    }
  } catch (err) {
    console.log("ERR _ _ _ AssignAdmin ManagemissedChat", err);
    return { error: err.message }; // Return the error message
  }
}


async function AssignSpecificUser(sid, newId) {
  try {
    console.log("AssignSpecificUser");
    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
    let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
    if (RoutingRules.length > 0) {
      let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES (?, ?, ?, ?)`;
      let assignAgentRes = await db.excuteQuery(assignAgentQuery, [newId, RoutingRules[0].SpecificUserUid, '-1', 1]);
      console.log("AssignSpecificUser", assignAgentRes);
      if (assignAgentRes.affectedRows > 0) {
        return true;
      } else {
        return { message: "Insertion into InteractionMapping failed" };
      }
    } else {
      return { message: "No routing rules found" };
    }
  } catch (err) {
    console.log("ERR _ _ _ AssignSpecificUser ManagemissedChat", err);
    return { error: err.message }; // Return the error message
  }
}

async function AssignMissedToContactOwner(sid, newId, agid, custid) {
  try {
    console.log("AssignMissedToContactOwner");
    let contactOwnerUid = await isDefaultContactOwner(sid, custid);
    console.log("contactOwnerUid", contactOwnerUid);
    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID = ?`;
    let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
    if (RoutingRules?.length > 0) {
      if (contactOwnerUid != undefined && RoutingRules[0].contactowner == '1') {
        let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
        let values = [[newId, contactOwnerUid, '-1', 1]]; // 2nd agid is MappedBy values in teambox uid is used here also
        let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values]);
        console.log("AssignMissedToContactOwner", updateInteractionMap);
        if (updateInteractionMap.affectedRows > 0) {
          return true;
        } else {
          return { message: "Insertion into InteractionMapping failed" };
        }
      }
    } else {
      return { message: "No routing rules found" };
    }
  } catch (err) {
    console.log("ERR _ _ _ AssignMissedToContactOwner ManagemissedChat", err);
    return { error: err.message }; // Return the error message
  }
}



module.exports = { RoundRobin, ManualAssign, assignToLastAssistedAgent, AssignToContactOwner }