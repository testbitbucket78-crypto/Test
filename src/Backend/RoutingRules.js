const settingVal = require('./settings/generalconstant')
const db = require('./dbhelper')
var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const moment = require('moment');
const commonFun = require('./common/resuableFunctions.js')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

async function isDefaultContactOwner(SP_ID, custid) {
  try {
    let contactOwnerQuery = `SELECT * FROM EndCustomer WHERE customerId =? and SP_ID=?  and isDeleted !=1`;
    let contactOwner = await db.excuteQuery(contactOwnerQuery, [custid, SP_ID]);
    let mappingUid = contactOwner[0]?.uid;
    if (contactOwner?.length == 0) {
      let defaultAdminQuery = `SELECT * FROM defaultActions WHERE spid=? AND  (isDeleted is null or isDeleted =0)`;
      let defaultAdmin = await db.excuteQuery(defaultAdminQuery, [SP_ID]);
      mappingUid = defaultAdmin[0]?.defaultAdminUid
    }
    //console.log("isDefaultContactOwne ***************", mappingUid);
    return mappingUid;
  } catch (err) {
    console.log("ERR -- isDefaultContactOwner", err)
    return undefined;
  }
}

async function updateInteraction(interactionId, spid, appliedRule, custid) {
  try {
    let isEmptyInteraction = await commonFun.isStatusEmpty(interactionId, spid, custid)

    let openStatus = await db.excuteQuery('update Interaction set interaction_status =? where InteractionId = ? and SP_ID =?', ['Open', interactionId, spid]);
    if (isEmptyInteraction == 1) {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      openStatus = await db.excuteQuery('update Interaction set interaction_status =? ,updated_at =? where InteractionId = ? and SP_ID =?', ['Open', updated_at, interactionId, spid]);
    }

    console.log(interactionId, "openStatus", openStatus?.affectedRows, appliedRule)
  } catch (err) {
    console.log("err openStatus", openStatus)
  }

}

async function AssignToContactOwner(sid, newId, agid, custid, isMissedChat) {
  try {
    console.log("AssignToContactOwner", sid, newId, agid, custid);
    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=${sid}`;
    let RoutingRules = await db.excuteQuery(RoutingRulesQuery, []);

    let contactOwner = await db.excuteQuery('SELECT * FROM EndCustomer WHERE customerId =? and SP_ID=?  and isDeleted !=1', [custid, sid]);
    let contactOwnerUid = contactOwner[0]?.uid;
    console.log(contactOwnerUid, "RoutingRules", RoutingRules?.length, contactOwnerUid != undefined, RoutingRules[0].contactowner, RoutingRules[0].contactowner == '1');
    if (RoutingRules.length > 0) {
      let isActiveStaus = await isAgentActive(sid, contactOwnerUid);
      if (contactOwnerUid != undefined && contactOwnerUid != null && RoutingRules[0].contactowner == '1' && isActiveStaus == true) {
        let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
        let values = [[newId, contactOwnerUid, agid, 1]]; // 2nd agid is MappedBy values in teambox uid is used here also
        let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values]);
        console.log("AssignToContactOwner --- contact owner assign", updateInteractionMap);
        if (updateInteractionMap?.affectedRows > 0) {
          let openAssignChat = await updateInteraction(newId, sid, 'AssignToContactOwner', custid)
          let myUTCString = new Date().toUTCString();
          const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          const currentAssignedUser = await commonFun.currentlyAssigned(newId);
          const check = await commonFun.notifiactionsToBeSent(currentAssignedUser,2);
          if(check){
          let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
          let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
          }
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

    let LastAssistedAgent = await db.excuteQuery('select * from InteractionMapping where InteractionId =?  order by created_at desc limit 1', [newId]);
    console.log(RoutingRules[0]?.broadcast == '1', LastAssistedAgent.length, new Date(), RoutingRules[0]?.broadcast == 1);
    let isActiveStaus = await isAgentActive(sid, LastAssistedAgent[0].LastAssistedAgent);
    if (LastAssistedAgent.length > 0 && RoutingRules[0]?.assignagent == '1' && isActiveStaus == true) {

      console.log("if ----- LastAssistedAgent and isActiveStaus", isActiveStaus);
        let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
        let assignAgent = await db.excuteQuery(assignAgentQuery, [[[newId, LastAssistedAgent[0].LastAssistedAgent, '-1', 1]]]);
        console.log("LastAssistedAgent", assignAgent);
        if (assignAgent?.affectedRows > 0) {
          let openAssignChat = await updateInteraction(newId, sid, 'LastAssistedAgent', custid)
          let myUTCString = new Date().toUTCString();
          const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          const currentAssignedUser = await commonFun.currentlyAssigned(newId);
          const check = await commonFun.notifiactionsToBeSent(currentAssignedUser,2);
          if(check){
          let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
          let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
          }
          return true; // Return true if insertion is successful

        }
    } else if (RoutingRules?.length > 0 && RoutingRules[0]?.broadcast == '1') {
      console.log("broadcast");
      let result = await BroadCast(sid, agid, newId);
      await ManagemissedChat(sid, newId, agid, custid, RoutingRules);
      return result; // Return the result from BroadCast
    } else if (RoutingRules?.length > 0 && RoutingRules[0]?.roundrobin == '1') {
      console.log("RoundRobin");
      let result = await RoundRobin(sid, newId, agid, custid);
      await ManagemissedChat(sid, newId, agid, custid, RoutingRules);
      return result; // Return the result from RoundRobin
    } else if (RoutingRules?.length > 0 && RoutingRules[0]?.manualassign == '1') {
      console.log("ManualAssign");
      let result = await ManualAssign(newId, sid, agid, custid);
      await ManagemissedChat(sid, newId, agid, custid, RoutingRules);
      return result; // Return the result from ManualAssign
    }
  } catch (err) {
    console.log("ERR _ _ _ assignToLastAssistedAgent", err);
    return { error: err.message }; // Return the error message
  }
}

async function getUsersBySPId(spid) {
  if (!spid) {
    console.log("SP_ID is required");
    return;
  }

  try {
    const query = `
      SELECT u.uid 
      FROM user u 
      JOIN roles r ON u.UserType = r.roleID 
      WHERE u.SP_ID = ? AND u.isDeleted != 1 AND u.IsActive < 2
    `;

    let result = await db.excuteQuery(query, [spid]);
    return result; // Array of users with 'uid'
  } catch (error) {
    console.error("Error fetching users by SP ID:", error);
    return [];
  }
}

async function BroadCast(sid, agid, newId) {
  try {
    console.log("BroadCast");
    let myUTCString = new Date().toUTCString();
    const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

    let allUsers = await getUsersBySPId(sid);
    for (const user of allUsers) {
      let UID = user?.uid
      const check = await commonFun.notifiactionsToBeSent(UID, 1);
      if (check) {
        const addNotification = `
          INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?
        `;
        const notifyvalues = [
          [sid, 'New Chat Notification', 'A new Unassigned Chat is available to assigned', agid, 'webhook', UID, created_at]
        ];
        await db.excuteQuery(addNotification, [notifyvalues]);
      }
    }
    return 'broadcast'; // Return the result of the query
  } catch (err) {
    console.log("ERR _ _ _ BroadCast", err);
    return { error: err.message }; // Return the error message
  }
}

async function isAgentActive(sid, uid) {
  try {
    let activeAgentQuery = "select *from user where IsActive=1 and SP_ID=? and uid = ? and isDeleted !=1 ";
    let activeAgent = await db.excuteQuery(activeAgentQuery, [sid, uid]);
    if (activeAgent?.length) {
      return true;
    }
    return false;
  } catch (err) {
    console.log("isAgentActive ERR", err)
  }
}

// setTimeout(async () => {
//   let response = await isAgentActive(sid, uid);
//   console.log(response)
// }, 3000)

async function RoundRobin(sid, newId, agid, custid) {
  try {
    console.log("RoundRobin");
    let isWorkingHours = await commonFun.isWorkingTime(sid);
    let isHoliday = await commonFun.isHolidays(sid)

    if (isWorkingHours == true && isHoliday == false) {
      let activeAgentQuery = `SELECT   r.RoleName,  u.*
FROM user u
JOIN roles r ON u.UserType = r.roleID
WHERE u.SP_ID =? AND u.isDeleted != 1 and u.IsActive =1 and r.RoleName != 'Admin'`//"select *from user where IsActive=1 and SP_ID=? and ParentId is not null and isDeleted !=1 ";


      let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
      let routingData = await db.excuteQuery(RoutingRulesQuery, [sid]);
      let maxAllowd = routingData.length > 0 ? routingData[0].conversationallowed : 0;
      if (routingData[0]?.enableAdmin == 1) {
        activeAgentQuery = "select *from user where IsActive=1 and SP_ID=? and isDeleted !=1 ";
      }
      let activeAgent = await db.excuteQuery(activeAgentQuery, [sid]);
      if (activeAgent.length > 0) {
        for (let agent of activeAgent) {
          let checkAssignInteraction = await db.excuteQuery(settingVal.checkAssignInteraction, [newId]);

          if ((checkAssignInteraction.length <= 0) || (checkAssignInteraction.length > 0 && checkAssignInteraction[0]?.AgentId == -1)) {
            console.log("(checkAssignInteraction.length <= 0) || (checkAssignInteraction?.AgentId == -1)");
            let assignedChatCount = await db.excuteQuery(settingVal.assignCount, [agent.uid, sid]);

            let chatCount = assignedChatCount.length > 0 ? assignedChatCount[0].count : 0;

            if (maxAllowd > chatCount) {
              let lastAgent = await db.excuteQuery('select * from InteractionMapping where InteractionId=? order by MappingId desc ', [newId])
              let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active,lastAssistedAgent) VALUES ?`;
              let chatAssigend = await db.excuteQuery(assignAgentQuery, [[[newId, agent.uid, '-1', 1, lastAgent[0]?.AgentId]]]);
              console.log("RoundRobin", chatAssigend);
              if (chatAssigend?.affectedRows > 0) {
                let openAssignChat = await updateInteraction(newId, sid, 'RoundRobin', custid)
                let myUTCString = new Date().toUTCString();
                const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
                const currentAssignedUser = await commonFun.currentlyAssigned(newId);
                const check = await commonFun.notifiactionsToBeSent(currentAssignedUser,2);
                if(check){
                let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
                let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
                }
                return true; // Return true if insertion is successful
              } else {
                return { message: "Insertion into InteractionMapping failed" };
              }
            }
          }
        }
      }
    } else {
      let result = await BroadCast(sid, agid, newId);
      return result;
    }
  } catch (err) {
    console.log("ERR _ _ _ RoundRobin", err);
    return { error: err.message }; // Return the error message
  }
}


async function ManualAssign(newId, sid, agid, custid) {
  try {
    console.log("ManualAssign");
    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
    let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
    if (RoutingRules?.length > 0) {
      let isActiveStaus = await isAgentActive(sid, RoutingRules[0].manualAssignUid);
      if (isActiveStaus == true) {
        let newAssignQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
        let assignvalues = [[newId, RoutingRules[0].manualAssignUid, agid, 1]];
        let assignRes = await db.excuteQuery(newAssignQuery, [assignvalues]);
        if (assignRes?.affectedRows > 0) {
          let openAssignChat = await updateInteraction(newId, sid, 'ManualAssign', custid)
          let myUTCString = new Date().toUTCString();
          const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          const currentAssignedUser = await commonFun.currentlyAssigned(newId);
          const check = await commonFun.notifiactionsToBeSent(currentAssignedUser,2);
          if(check){
          let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
          let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
          }
          return true; // Return true if insertion is successful
        }
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
    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
    let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
    if (RoutingRules?.length > 0 && RoutingRules[0]?.isMissedChat == 1) {
      let checkAssignInteraction = await db.excuteQuery(settingVal.checkAssignInteraction, [newId]);
      console.log("checkAssignInteraction.length", checkAssignInteraction.length);

      if ((checkAssignInteraction.length <= 0) || (checkAssignInteraction.length > 0 && checkAssignInteraction[0]?.AgentId == -1) && checkAssignInteraction[0]?.isAgentInactiveTimeOut != 1) {
        console.log("missed -------------------");

        let time = parseInt((RoutingRules[0].timeoutperiod).replace(/\s*(Min|hour)/g, '')); // Get timeout period as a number
        console.log("missed chat time", time);

        let performOperation =
          RoutingRules[0].isMissChatAssigContactOwner === 1
            ? async () => await AssignMissedToContactOwner(sid, newId, agid, custid)
            : RoutingRules[0].assignspecificuser === 1
              ? async () => await AssignSpecificUser(sid, newId, agid, custid)
              : RoutingRules[0].isadmin === 1
                ? async () => await AssignAdmin(newId, sid, agid, custid)
                : async () => await AssignAdmin(newId, sid, agid, custid);

         // Get created_at timestamp from checkAssignInteraction
        let createdAt = new Date(checkAssignInteraction[0]?.created_at);
        let currentTime = new Date();

        // Convert time to milliseconds (e.g., time in minutes to milliseconds)
        let timeoutMillis = time * 60 * 1000;

        // Check if created_at is older than the current time minus timeout period
        if (currentTime - createdAt >= timeoutMillis) {
          // Execute immediately if condition met
          console.log("Immediate execution of performOperation due to timeout condition");
          let result = await performOperation();
          if (result === true) {
            console.log("Operation successful");
          } else {
            console.log("Operation failed", result);
          }
        } else {
          // Set timeout to perform the operation after the remaining time
          let remainingTime = timeoutMillis - (currentTime - createdAt);
          console.log(`Scheduling operation in ${remainingTime / 1000 / 60} minutes`);
          setTimeout(async () => {
            let result = await performOperation();
            if (result === true) {
              console.log("Operation successful");
            } else {
              console.log("Operation failed", result);
            }
          }, remainingTime); // Use the remaining time for the timeout
        }

        return true;
      }
    }
  } catch (err) {
    console.log("ERR _ _ _ ManagemissedChat", err);
    return { error: err.message }; // Return the error message
  }
}

async function AssignAdmin(newId, sid, agid, custid) {
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
    let assignAgentRes = await db.excuteQuery(assignAgentQuery, [[[newId, (admin ? admin : agid), '-1', 1]]]);
    //console.log("AssignAdmin", assignAgentRes);
    if (assignAgentRes?.affectedRows > 0) {
      let openAssignChat = await updateInteraction(newId, sid, 'AssignAdmin', custid)
      let myUTCString = new Date().toUTCString();
      const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      const currentAssignedUser = await commonFun.currentlyAssigned(newId);
      const check = await commonFun.notifiactionsToBeSent(currentAssignedUser,2);
      if(check){
      let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
      let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
      }
      return true;
    } else {
      return { message: "Insertion into InteractionMapping failed" };
    }
  } catch (err) {
    console.log("ERR _ _ _ AssignAdmin ManagemissedChat", err);
    return { error: err.message }; // Return the error message
  }
}


async function AssignSpecificUser(sid, newId, agid, custid) {
  try {
    console.log("AssignSpecificUser");
    let RoutingRulesQuery = `SELECT * FROM routingrules WHERE SP_ID=?`;
    let RoutingRules = await db.excuteQuery(RoutingRulesQuery, [sid]);
    if (RoutingRules.length > 0) {
      let assignAgentQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES (?, ?, ?, ?)`;
      let assignAgentRes = await db.excuteQuery(assignAgentQuery, [newId, RoutingRules[0].SpecificUserUid, '-1', 1]);
      console.log("AssignSpecificUser", assignAgentRes);
      if (assignAgentRes?.affectedRows > 0) {
        let openAssignChat = await updateInteraction(newId, sid, 'AssignSpecificUser', custid)
        let myUTCString = new Date().toUTCString();
        const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        const currentAssignedUser = await commonFun.currentlyAssigned(newId);
        const check = await commonFun.notifiactionsToBeSent(currentAssignedUser,2);
        if(check){
        let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
        let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
        }
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
      if ((contactOwnerUid != undefined && RoutingRules[0].contactowner == '1') || RoutingRules[0].isMissChatAssigContactOwner == '1') {
        let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
        let values = [[newId, contactOwnerUid, '-1', 1]]; // 2nd agid is MappedBy values in teambox uid is used here also
        let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values]);
        console.log("AssignMissedToContactOwner", updateInteractionMap);
        if (updateInteractionMap?.affectedRows > 0) {
          let openAssignChat = await updateInteraction(newId, sid, 'AssignMissedToContactOwner', custid)
          let myUTCString = new Date().toUTCString();
          const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          const currentAssignedUser = await commonFun.currentlyAssigned(newId);
          const check = await commonFun.notifiactionsToBeSent(currentAssignedUser,2);
          if(check){
          let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
          let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
          }
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