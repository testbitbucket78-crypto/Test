const db = require('../dbhelper');
const { ContactsAdded, contactBulkUpdate, deleteContactsModel, MessageReceivedModel, MessageStatusModel,
    conversationStatusModel, conversationAssignedModel, templateStatusModel, conversationCreatedModel
      }= require('./commonModel');
const { dispatchWebhookEvent }  = require('../Services/webhookDispatcher');
const { WebhookEventType } = require('../enum');
const { webhookPayload } = require('./constant');

// todo 1 made for the insert only ( Deprecated extractKeysFromQuery )
// const extractKeysFromQuery = (query) => {
//     const match = query.match(/\(([^)]+)\)/);
//     if (!match) return [];
//     return match[1].split(',').map(k => k.trim());
// };

// todo 2 made made for insert and update querry (deprecated 2)
// const extractKeysFromQuery = (query) => {
//     if (query.trim().toUpperCase().startsWith('INSERT')) {
//       // Extract keys from INSERT INTO (...) VALUES (...)
//       const match = query.match(/\(([^)]+)\)/);
//       if (!match) return [];
//       return match[1].split(',').map(k => k.trim());
//     } else if (query.trim().toUpperCase().startsWith('UPDATE')) {
//       // Extract keys from UPDATE ... SET key1 =?, key2 =?, ...
//       const setPart = query.split('SET')[1]?.split('WHERE')[0];
//       if (!setPart) return [];
//       return setPart
//         .split(',')
//         .map(pair => pair.split('=')[0].trim())
//         .filter(key => key.length);
//     }
//     return [];
//   };
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
    console.error('Error fetching user name:', error.message);
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
    console.error('Error fetching customer number:', error.message);
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
    console.error('Error fetching mobile numbers:', error.message);
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

  async function addContact (spid , querry, values){
    const keys = extractKeysFromQuery(querry);
    const payload = payloadFromKeysAndValues(keys, values)
    // const payload = {};
    // keys.forEach((key, index) => {
    //   payload[key] = values[index];
    // });
    
    var webhookPayload = new ContactsAdded(payload, keys);
    webhookPayload.contact_creator = await getUserNameById(webhookPayload?.data?.uid); 

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
    const WebhookPayload = new ContactsAdded(payload, keys);
    
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

  // async function ContactBulkUpdate (length, spid, querry, values) { // todo deprecate this function
  //   const keys = extractKeysFromQuery(querry);
  //   const payload = payloadFromKeysAndValues(keys, values)
  
  //   const WebhookPayload = new contactBulkUpdate(payload, keys);
  //   await dispatchWebhookEvent(spid, WebhookPayload.eventType, WebhookPayload);
  //   try {
  //     let result = await db.excuteQuery(querry, values);
  //     return result;

  //     } catch (error) {
  //       return {
  //         success: false,
  //         error: error.message,
  //       };
  //     }
  // }
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
        const payload = { data: collectedWebhookRows };
        const WebhookPayload = new contactBulkUpdate(payload, collectedWebhookKeys, 'Bulk Upload');
        WebhookPayload.contact_updater = user;

        await dispatchWebhookEvent(spid, WebhookPayload.eventType, WebhookPayload);
        collectedWebhookRows = []; // Clear the collected rows after sending the webhook
        collectedWebhookKeys = null; // Clear the keys after sending the webhook
      }
  
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async function deleteContacts (data) {
    let WebhookPayload = new deleteContactsModel(data);
    WebhookPayload.delete_initiator = await getUserNameById(data?.userId); 
    await dispatchWebhookEvent(WebhookPayload.SP_ID, WebhookPayload.eventType, WebhookPayload);
    
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
    payload.status = await getUserNameById(body?.AgentId);
    await dispatchWebhookEvent(body?.SP_ID, payload.eventType, payload);
  }

  async function templateStatus(event, spid) {
    const payload = new templateStatusModel(event, spid);
    payload.channel_number = await getChannelNumberBySpId(spid);
    await dispatchWebhookEvent(payload.SP_ID, payload.eventType, payload);
  }

  async function conversationCreated(spid, customerId, displayPhoneNumber) {
    const payload = new conversationCreatedModel(spid, customerId, '', displayPhoneNumber);
    payload.channel_number = await getChannelNumberBySpId(spid);
    await dispatchWebhookEvent(payload.SP_ID, payload.eventType, payload);
  }

  async function flowReceieved(spid, payload) {
     //const webhookPayload = new flowRecievedModel(payload);
    //await dispatchWebhookEvent(spid, webhookPayload.eventType, webhookPayload);
  }

  module.exports = {addContact, updateContacts, ContactBulkUpdate, deleteContacts, messageRecieved, messageStatus, conversationStatus, conversationAssigned, templateStatus, conversationCreated }

