const db = require('../dbhelper');
const { ContactsAdded, contactBulkUpdate, deleteContactsModel, MessageReceivedModel, MessageStatusModel,
    conversationStatusModel, conversationAssignedModel, templateStatusModel, conversationCreatedModel
      }= require('./commonModel');
const { dispatchWebhookEvent }  = require('../Services/webhookDispatcher');
const { WebhookEventType } = require('../enum');
const { webhookPayload } = require('./constant');
const logger = require('./logger.log');



  // todo made it to ingnore keys heaving static value 
// const extractKeysFromQuery = (query) => {
//   const trimmedQuery = query.trim().toUpperCase();

//   if (trimmedQuery.startsWith('INSERT')) {
//     const match = query.match(/\(([^)]+)\)/);
//     if (!match) return [];
//     return match[1].split(',').map(k => k.trim());
//   } else if (trimmedQuery.startsWith('UPDATE')) {
//     const setPart = query.split(/SET/i)[1]?.split(/WHERE/i)[0];
//     if (!setPart) return [];

//     return setPart
//       .split(',')
//       .map(pair => pair.trim())
//       .filter(pair => pair.includes('='))
//       .map(pair => {
//         const [key, value] = pair.split('=').map(x => x.trim());
//         // Include the key only if the value is exactly '?'
//         return value === '?' ? key : null;
//       })
//       .filter(Boolean); // Remove nulls
//   }

//   return [];
// };

async function getUserNameById(userId) {
  try {
    const query = 'SELECT name FROM user WHERE uid = ?';
    const values = [userId];
    const result = await db.excuteQuery(query, values);
    if (result.length > 0) {
      return result[0].name; 
    } else {
      return 'Unknown User'; 
    }
  } catch (error) {
    return 'Unknown User'; 
  }
}

async function getCustomerNumberByInteractionId(interactionId) {
  try {
    const query = `
      SELECT e.Phone_number 
      FROM Interaction i
      JOIN EndCustomer e ON i.customerId = e.customerId
      WHERE i.InteractionId = ?
    `;
    const values = [interactionId];
    const result = await db.excuteQuery(query, values);
    if (result.length > 0) {
      return result[0].Phone_number;
    } else {
      return null;
    }
  } catch (error) {
    logger.error(`Error fetching customer number:: ${error}`)
    return null;
  }
}

async function getChannelNumberBySpId(spId) {
  try {
    const query = `
      SELECT mobile_number 
      FROM user 
      WHERE SP_ID = ? 
        AND isDeleted != 1 
        AND IsActive != 2 
        AND ParentId IS NULL
    `;
    const values = [spId];
    const result = await db.excuteQuery(query, values);
    if(result.length > 0){
      return result[0].mobile_number;
    } else {
      return null;
    }
  } catch (error) {
    logger.error(`Error fetching mobile numbers:: ${error}`)
    return [];
  }
}

const extractKeysFromQuery = (query) => {
  const trimmedQuery = query.trim().toUpperCase();

  if (trimmedQuery.startsWith('INSERT')) {
    const match = query.match(/\(([^)]+)\)/);
    if (!match) return [];
    return match[1].split(',').map(k => k.trim());
  } else if (trimmedQuery.startsWith('UPDATE')) {
    const [, setPartRaw] = query.split(/SET/i);
    if (!setPartRaw) return [];

    const [setPart, wherePart] = setPartRaw.split(/WHERE/i);

    const keysFromSet = setPart
      .split(',')
      .map(pair => pair.trim())
      .filter(pair => pair.includes('='))
      .map(pair => {
        const [key, value] = pair.split('=').map(x => x.trim());
        return value === '?' ? key : null;
      })
      .filter(Boolean);

    const keysFromWhere = wherePart
      ? wherePart
          .split(/AND/i)
          .map(pair => pair.trim())
          .filter(pair => pair.includes('='))
          .map(pair => {
            const [key, value] = pair.split('=').map(x => x.trim());
            return value === '?' ? key : null;
          })
          .filter(Boolean)
      : [];

    return [...keysFromSet, ...keysFromWhere];
  }

  return [];
};

const payloadFromKeysAndValues = (keys, values) => {
    const payload = {};
    keys.forEach((key, index) => {
        payload[key] = values[index];
    });
   return payload;
};

async function customizedNames(spid) {
  const query = `SELECT 
    ActuallName AS actual_column_name,
    displayName AS customized_column_name
FROM 
(
    -- Static Fields
    SELECT 'Name' AS displayName, 'Name' AS ActuallName
    UNION ALL
    SELECT 'Phone_number', 'Phone_number'
    UNION ALL
    SELECT 'emailId', 'emailId'
    UNION ALL
    SELECT 'OptInStatus', 'OptInStatus'
    UNION ALL
    SELECT 'ContactOwner', 'ContactOwner'
    UNION ALL
    SELECT 'tag', 'tag'

    -- Dynamic DB Columns from EndCustomer
    UNION ALL
    SELECT 
        column_name AS displayName,
        column_name AS ActuallName
    FROM information_schema.columns
    WHERE table_name = 'EndCustomer' 
      AND column_name NOT LIKE '%column%' 
      AND column_name NOT IN (
            'created_at', 'customerId', 'isDeleted', 'SP_ID', 'uid', 'updated_at',
            'isBlockedOn', 'isBlocked', 'channel', 'displayPhoneNumber', 'countryCode',
            'IsTemporary', 'contact_profile', 'InstagramId', 'facebookId', 'Country',
            'state', 'city', 'pincode', 'address', 'sex', 'status', 'age',
            'OptInStatus','tag','defaultAction_PauseTime'
        )

    -- Custom User Defined Fields
    UNION ALL
    SELECT 
        ColumnName AS displayName,
        CustomColumn AS ActuallName
    FROM SPIDCustomContactFields  
    WHERE SP_ID = ? AND isDeleted != 1
) AS column_mapping
GROUP BY ActuallName, displayName
ORDER BY actual_column_name;`;
 const result = await db.excuteQuery(query, spid);
 return result
}

  async function addContact (spid , querry, values, isTemporary = false) {
    const keys = extractKeysFromQuery(querry);
    const payload = payloadFromKeysAndValues(keys, values)
    const columnAndTheirNames = await customizedNames(spid)
    
    var webhookPayload = new ContactsAdded(payload, keys, columnAndTheirNames);
    webhookPayload.contact_creator = await getUserNameById(webhookPayload?.data?.uid); 

    if (isTemporary) {
      await dispatchWebhookEvent(spid, webhookPayload.eventType , webhookPayload)
      return;
    }

    try {
      let result = await db.excuteQuery(querry, values);
          webhookPayload.contact_id = result?.insertId || null;
          await dispatchWebhookEvent(spid, webhookPayload.eventType , webhookPayload)
          return result;

      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
  }

  async function updateContacts (spid , querry, values){
    const keys = extractKeysFromQuery(querry);
    const payload = payloadFromKeysAndValues(keys, values)
    const columnAndTheirNames = await customizedNames(spid)

    const WebhookPayload = new ContactsAdded(payload, keys, columnAndTheirNames);
    
    WebhookPayload.eventType = WebhookEventType.ContactUpdated;
    WebhookPayload.contact_creator = await getUserNameById(WebhookPayload?.data?.uid); 
    WebhookPayload.contact_id = WebhookPayload?.data?.customerId || null;

    await dispatchWebhookEvent(spid, WebhookPayload.eventType, WebhookPayload);
    try {
      let result = await db.excuteQuery(querry, values);
      return result;
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
  }


const BATCH_SIZE = 200;
let collectedWebhookRows = [];
let collectedWebhookKeys = null;
  async function ContactBulkUpdate(length, spid, query, values, user) {
  const keys = extractKeysFromQuery(query);

  if (!collectedWebhookKeys) {
    collectedWebhookKeys = keys;
  }
  
  collectedWebhookRows.push(values);

  try {
    const result = await db.excuteQuery(query, values);
  
    if (collectedWebhookRows.length === length) {
      for (let i = 0; i < collectedWebhookRows.length; i += BATCH_SIZE) {
        const batch = collectedWebhookRows.slice(i, i + BATCH_SIZE);
        const payload = { data: batch };
        const WebhookPayload = new contactBulkUpdate(payload, collectedWebhookKeys, 'Bulk Upload');
        WebhookPayload.contact_updater = user;

        await dispatchWebhookEvent(spid, WebhookPayload.eventType, WebhookPayload);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Clear everything after all batches are sent
      collectedWebhookRows = [];
      collectedWebhookKeys = null;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

 // ----------- todo It is Queuing technique works correct for bulk update currently using diff way for now-------------
// const BATCH_SIZE = 5;
// let webhookQueue = [];
// let webhookKeys = null;
// let webhookMeta = {
//   totalExpected: 0,
//   processedCount: 0,
//   spid: null,
//   user: null,
//   isDispatching: false
// };

// async function flushWebhookQueue(forceFlush = false) {
//   // While full batches are available, send them
//   while (webhookQueue.length >= BATCH_SIZE) {
//     const batch = webhookQueue.splice(0, BATCH_SIZE);
//     const payload = { data: batch };
//     const webhookPayload = new contactBulkUpdate(payload, webhookKeys, 'Bulk Upload');
//     webhookPayload.contact_updater = webhookMeta.user;

//     await dispatchWebhookEvent(webhookMeta.spid, webhookPayload.eventType, webhookPayload);
//   }

//   // If this is the final flush and there are leftover rows
//   if (forceFlush && webhookQueue.length > 0) {
//     const payload = { data: webhookQueue };
//     const webhookPayload = new contactBulkUpdate(payload, webhookKeys, 'Bulk Upload');
//     webhookPayload.contact_updater = webhookMeta.user;

//     await dispatchWebhookEvent(webhookMeta.spid, webhookPayload.eventType, webhookPayload);
//     webhookQueue = [];
//   }

//   // Reset when done
//   if (forceFlush) {
//     webhookKeys = null;
//     webhookMeta = {
//       totalExpected: 0,
//       processedCount: 0,
//       spid: null,
//       user: null,
//       isDispatching: false
//     };
//   }
// }

// async function ContactBulkUpdate(length, spid, query, values, user) {
//   const keys = extractKeysFromQuery(query);

//   // Initialize state on first call
//   if (webhookMeta.processedCount === 0) {
//     webhookKeys = keys;
//     webhookMeta.totalExpected = length;
//     webhookMeta.spid = spid;
//     webhookMeta.user = user;
//   }

//   webhookQueue.push(values);
//   webhookMeta.processedCount++;

//   try {
//     const result = await db.excuteQuery(query, values);

//     // Send batch if threshold met
//     if (webhookQueue.length >= BATCH_SIZE) {
//       await flushWebhookQueue(false);
//     }

//     // If this is the final call, flush remaining
//     if (webhookMeta.processedCount === webhookMeta.totalExpected) {
//       await flushWebhookQueue(true);
//     }

//     return result;
//   } catch (error) {
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// }
  

  // async function deleteContacts (data) { // todo deprecated
  //   let WebhookPayload = new deleteContactsModel(data);
  //   WebhookPayload.delete_initiator = await getUserNameById(data?.userId); 
  //   await dispatchWebhookEvent(data?.SP_ID, WebhookPayload.eventType, WebhookPayload);
  // }
  async function deleteContacts(data) {
  const fullPayload = new deleteContactsModel(data);
  fullPayload.delete_initiator = await getUserNameById(data?.userId);

  const chunkSize = 1000;  // need to delete the bulk in chunks now hence deprecating the old func ().
  const allDeleted = fullPayload.deleted;

  for (let i = 0; i < allDeleted.length; i += chunkSize) {
    const chunk = allDeleted.slice(i, i + chunkSize);

    const chunkPayload = {
      eventType: fullPayload.eventType,
      delete_initiator: fullPayload.delete_initiator,
      deleted: chunk
    };

    await dispatchWebhookEvent(data?.SP_ID, fullPayload.eventType, chunkPayload);
  }
}
  
  async function messageRecieved(
    spid,
    phoneNo,
    message_direction,
    message_text,
    message_media,
    Message_template_id,
    Quick_reply_id,
    Type,
    ExternalMessageId,
    display_phone_number,
    contactName,
    media_type,
    ackStatus,
    source,                         // e.g., 'WA Web' 'WA API'
    timestamp,
    countryCode,
    EcPhonewithoutcountryCode,
    extra1,                         // Optional/Reserved
    extra2,                         // Optional/Reserved
    retryCount                      // e.g., 0
  ) {
    const payload = new MessageReceivedModel(
      spid,
      phoneNo,
      message_direction,
      message_text,
      message_media,
      Message_template_id,
      Quick_reply_id,
      Type,
      ExternalMessageId,
      display_phone_number,
      contactName,
      media_type,
      ackStatus,
      source,
      timestamp,
      countryCode,
      EcPhonewithoutcountryCode,
      extra1,
      extra2,
      retryCount
    );
  
    await dispatchWebhookEvent(spid, payload.eventType, payload);
  }
 async function messageRecieved(
    spid,
    phoneNo,
    message_direction,
    message_text,
    message_media,
    Message_template_id,
    Quick_reply_id,
    Type,
    ExternalMessageId,
    display_phone_number,
    contactName,
    media_type,
    ackStatus,
    source,                         // e.g., 'WA Web' 'WA API'
    timestamp,
    countryCode,
    EcPhonewithoutcountryCode,
    extra1,                         // Optional/Reserved
    extra2,                         // Optional/Reserved
    retryCount                      // e.g., 0
  ) {
    const payload = new MessageReceivedModel(
      spid,
      phoneNo,
      message_direction,
      message_text,
      message_media,
      Message_template_id,
      Quick_reply_id,
      Type,
      ExternalMessageId,
      display_phone_number,
      contactName,
      media_type,
      ackStatus,
      source,
      timestamp,
      countryCode,
      EcPhonewithoutcountryCode,
      extra1,
      extra2,
      retryCount
    );
  
    await dispatchWebhookEvent(spid, payload.eventType, payload);
  }

  async function messageStatus(message, ack, spid) {
    const payload = new MessageStatusModel(message, ack, spid);
    await dispatchWebhookEvent(spid, payload.eventType, payload);
  }

  async function conversationStatus(spid, interaction_status, InteractionId) {
    const payload = new conversationStatusModel(spid, interaction_status, InteractionId);
    payload.customer_number = await getCustomerNumberByInteractionId(InteractionId)
    payload.channel_number = await getChannelNumberBySpId(spid);
    await dispatchWebhookEvent(spid, payload.eventType, payload);
  }

  async function conversationAssigned(body) {
    const payload = new conversationAssignedModel(body);
    payload.customer_number = await getCustomerNumberByInteractionId(body.InteractionId);
    payload.channel_number = await getChannelNumberBySpId(body?.SP_ID);
    payload.assignment = await getUserNameById(body?.AgentId);
    await dispatchWebhookEvent(body?.SP_ID, payload.eventType, payload);
  }

  async function templateStatus(event, spid) {
    const payload = new templateStatusModel(event, spid);
    payload.channel_number = await getChannelNumberBySpId(spid);
    await dispatchWebhookEvent(spid, payload.eventType, payload);
  }

  async function conversationCreated(spid, customerId, displayPhoneNumber, userId) {
    const payload = new conversationCreatedModel(spid, customerId, '', displayPhoneNumber);
    payload.channel_number = await getChannelNumberBySpId(spid);
    const userName = await getUserNameById(userId);
    payload.source = userName == 'Unknown User' ? 'System' : userName; // Default to 'Bot' if user not found
    await dispatchWebhookEvent(spid, payload.eventType, payload);
  }

  async function flowReceieved(spid, payload) {
     //const webhookPayload = new flowRecievedModel(payload);
    //await dispatchWebhookEvent(spid, webhookPayload.eventType, webhookPayload);
  }

  module.exports = {addContact, updateContacts, ContactBulkUpdate, deleteContacts, messageRecieved, messageStatus, conversationStatus, conversationAssigned, templateStatus, conversationCreated }

