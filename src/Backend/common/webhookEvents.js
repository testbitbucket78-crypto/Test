const db = require('../dbhelper');
const { ContactsAdded, contactBulkUpdate, deleteContactsModel, MessageReceivedModel, MessageStatusModel,
    conversationStatusModel, conversationAssignedModel, templateStatusModel, conversationCreatedModel
      }= require('./commonModel');
const {webhookService}  = require('../Services/webhookService');
const { WebhookEventType } = require('../enum')

// todo 1 made for the insert only ( Deprecated extractKeysFromQuery )
// const extractKeysFromQuery = (query) => {
//     const match = query.match(/\(([^)]+)\)/);
//     if (!match) return [];
//     return match[1].split(',').map(k => k.trim());
// };

// todo 2 made made for insert and update querry
const extractKeysFromQuery = (query) => {
    if (query.trim().toUpperCase().startsWith('INSERT')) {
      // Extract keys from INSERT INTO (...) VALUES (...)
      const match = query.match(/\(([^)]+)\)/);
      if (!match) return [];
      return match[1].split(',').map(k => k.trim());
    } else if (query.trim().toUpperCase().startsWith('UPDATE')) {
      // Extract keys from UPDATE ... SET key1 =?, key2 =?, ...
      const setPart = query.split('SET')[1]?.split('WHERE')[0];
      if (!setPart) return [];
      return setPart
        .split(',')
        .map(pair => pair.split('=')[0].trim())
        .filter(key => key.length);
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
  
    const webhookPayload = new ContactsAdded(payload, keys);
    await webhookService(spid, webhookPayload.eventType , webhookPayload)
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

  async function updateContacts (spid , querry, values){
    const keys = extractKeysFromQuery(querry);
    const payload = payloadFromKeysAndValues(keys, values)
    const WebhookPayload = new ContactsAdded(payload, keys);

    WebhookPayload.eventType = WebhookEventType.ContactUpdated;
    await webhookService(spid, WebhookPayload.eventType, WebhookPayload);
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

  async function ContactBulkUpdate (spid, querry, values) {
    const keys = extractKeysFromQuery(querry);
    const payload = payloadFromKeysAndValues(keys, values)
  
    const WebhookPayload = new contactBulkUpdate(payload, keys);
    await webhookService(spid, WebhookPayload.eventType, WebhookPayload);
    try {
      let result = await db.excuteQuery(query, values);
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
    await webhookService(WebhookPayload.SP_ID, WebhookPayload.eventType, WebhookPayload);
    
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
  
    await webhookService(spid, payload.eventType, payload);
  }


  async function messageStatus(message, ack, spid) {
    const payload = new MessageStatusModel(message, ack, spid);
    await webhookService(spid, payload.eventType, payload);
  }

  async function conversationStatus(spid, interaction_status, InteractionId) {
    const payload = new conversationStatusModel(spid, interaction_status, InteractionId);
    await webhookService(spid, payload.eventType, payload);
  }

  async function conversationAssigned(body) {
    const payload = new conversationAssignedModel(body);
    await webhookService(payload.SP_ID, payload.eventType, payload);
  }

  async function templateStatus(event, spid) {
    const payload = new templateStatusModel(event, spid);
    await webhookService(payload.SP_ID, payload.eventType, payload);
  }

  async function conversationCreated(spid, customerId) {
    const payload = new conversationCreatedModel(spid, customerId);
    await webhookService(payload.SP_ID, payload.eventType, payload);
  }

  async function flowReceieved(spid, payload) {
     //const webhookPayload = new flowRecievedModel(payload);
    //await webhookService(spid, webhookPayload.eventType, webhookPayload);
  }

  module.exports = {addContact, updateContacts, ContactBulkUpdate, deleteContacts, messageRecieved, messageStatus, conversationStatus, conversationAssigned, templateStatus, conversationCreated }

