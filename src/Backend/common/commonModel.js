const { WebhookEventType, messageAckStatus } = require('../enum') //ConversationStatusMap
const moment = require('moment');
class ContactsAdded {
    constructor(payload, keys) {
      this.eventType = WebhookEventType.ContactCreated;
      this.contact_creator = 'System'; // default to 'System' if not provided
      this.contact_id =  null; // default to null if not provided
      this.data = {};
  
      keys.forEach((key) => {
        this.data[key] = payload[key];
      });
    }
  }

  // class contactBulkUpdate { // todo deprecated
  //   constructor(payload, keys, action) {
  //       this.eventType = WebhookEventType.ContactCreated;
  //       this.Action = action;
  //       this.data = {};
    
  //       keys.forEach((key) => {
  //         this.data[key] = payload[key];
  //       });
  //     }
  // }
  class contactBulkUpdate {
    constructor(payload, keys, action) {
      this.eventType = WebhookEventType.ContactBulkUpdate;
      this.Action = action || 'Bulk Upload';
      this.contact_updater = 'System'; // default to 'System' if not provided
      this.data = [];
  
      payload.data.forEach((row) => {
        const rowObj = {};
        keys.forEach((key, index) => {
          rowObj[key] = row[index];
        });
        this.data.push(rowObj);
      });
    }
  }

  // class deleteContactsModel { // todo deprecated
  //   constructor(payload) {
  //     this.eventType = WebhookEventType.ContactDeleted;
  //     this.SP_ID = payload.SP_ID;
  //     this.customerIds = Array.isArray(payload.customerId) ? payload.customerId : [payload.customerId];
  //   }
  // }

class deleteContactsModel {
  constructor(payload) {
    this.eventType = WebhookEventType.ContactDeleted;
    //this.SP_ID = payload.SP_ID;
    this.delete_initiator = 'System';

    const ids = Array.isArray(payload.customerId)
      ? payload.customerId
      : [payload.customerId];

    const numbers = Array.isArray(payload.customerNumber)
      ? payload.customerNumber
      : [payload.customerNumber];

    this.deleted = ids.map((id, index) => ({
      contact_id: id,
      customer_number: numbers[index] || null
    }));
  }
}

  // class MessageReceivedModel {// todo deprecated
  //   constructor(
  //     spid,
  //     phoneNo,                  // sender (customer)
  //     message_direction,
  //     message_text,
  //     message_media,
  //     Message_template_id,
  //     Quick_reply_id,
  //     Type,
  //     ExternalMessageId,
  //     display_phone_number,     // receiver (your business number)
  //     contactName,
  //     media_type,
  //     ackStatus,
  //     source,                   // 'WA Web'
  //     timestamp,
  //     countryCode,
  //     EcPhonewithoutcountryCode,
  //     extra1,                   // '' (not used currently)
  //     extra2,                   // '' (not used currently)
  //     retryCount                // 0
  //   ) {
  //     this.eventType = WebhookEventType.MessageReceived;
  //     this.SP_ID = spid;
  //     this.sender = {
  //       phoneNo,
  //       contactName,
  //       countryCode,
  //       EcPhonewithoutcountryCode
  //     };
  //     this.receiver = {
  //       display_phone_number,
  //       source
  //     };
  //     this.message = {
  //       direction: message_direction,
  //       text: message_text,
  //       media: message_media,
  //       media_type,
  //       type: Type,
  //       messageTemplateId: Message_template_id,
  //       quickReplyId: Quick_reply_id,
  //       externalMessageId: ExternalMessageId,
  //       ackStatus,
  //       timestamp
  //     };
  //   }
  // }

  class MessageReceivedModel {
    constructor(
      spid,
      phoneNo,                  // sender (customer)
      message_direction,
      message_text,
      message_media,
      Message_template_id,
      Quick_reply_id,
      Type,
      ExternalMessageId,
      display_phone_number,     // receiver (your business number)
      contactName,
      media_type,
      ackStatus,
      source,                   // 'WA Web'
      timestamp,
      countryCode,
      EcPhonewithoutcountryCode,
      extra1,                   // '' (not used currently)
      extra2,                   // '' (not used currently)
      retryCount                // 0
    ) {
      this.eventType = WebhookEventType.MessageReceived;
      //this.SP_ID = spid;
      this.channel_number = display_phone_number;
      this.sender = {
        phoneNo,
        contactName,
        countryCode,
        EcPhonewithoutcountryCode
      };
      this.receiver = {
        phoneNo: display_phone_number,
        source
      };
      this.message = {
        direction: message_direction,
        text: message_text,
        media: message_media,
        media_type,
        type: Type,
        messageTemplateId: Message_template_id,
        quickReplyId: Quick_reply_id,
        externalMessageId: ExternalMessageId,
        ackStatus,
        timestamp,
        quoted_id: message_media?.quoted_id || null,
        mime_type: message_media?.mime_type || null,
      };
    }
  }
  class MessageStatusModel {
    constructor(message, ack, spid) { // todo 
      this.eventType = WebhookEventType.MessageStatus;
      this.customer_number = message.to.replace(/@c\.us$/, "");
      this.channel_number = message?.from.replace(/@c\.us$/, "");
      //this.statusCode = parseInt(ack); // 1 = sent, 2 = delivered, 3 = read
      this.status = messageAckStatus[ack]; // 1 = sent, 2 = delivered, 3 = read
      this.messageId = message?._data?.id?.id || null;
      //this.spid = spid;
  
      const rawTimestamp = new Date(message.timestamp * 1000).toUTCString();
      this.message_time = moment.utc(rawTimestamp).format('YYYY-MM-DD HH:mm:ss');
  
      // const nowUTC = new Date().toUTCString();
      // this.lastModified = moment.utc(nowUTC).format('YYYY-MM-DD HH:mm:ss');
    }
  }

  class conversationStatusModel {
    constructor(spid, conversationStatus , InteractionId) {
        this.channel_number = null; // todo 1
        //this.SP_ID = spid;
        this.eventType = WebhookEventType.ConversationStatusUpdate;
        this.status = conversationStatus; // 'Open', 'Resolved', 'Assigned', 'Created'
        this.customer_number = null; // todo 1
        // this.eventType = conversationStatus;
        this.InteractionId = InteractionId;
      }
  }
  class conversationAssignedModel {
    constructor(args) {
      this.channel_number = null;
      this.eventType = WebhookEventType.ConversationAssigned //'conversation.assigned';
      //this.action = args.action || '';
      this.customer_number =  null; 
      this.source = args.action_by || 'system'; // 'user name>/system/incoming'
      this.status = null; //todo 1
      //this.action_at = args.action_at || new Date().toISOString();
      // this.action_by = args.action_by || '';
      //this.AgentId = args.AgentId || null;
      //this.InteractionId = args.InteractionId || null;
      //this.lastAssistedAgent = args.lastAssistedAgent || null;
      //this.MappedBy = args.MappedBy || null;
      //this.SP_ID = args.SP_ID || '';
    }
  }

  class templateStatusModel {
    constructor(event, spid){
        this.channel_number = null; // todo 1
        this.eventType = WebhookEventType.TemplateStatus;
        //this.SP_ID = spid || '';
        this.templateId = event?.message_template_id || null;
        this.status = event?.event || null;
    }
  }
 
  class conversationCreatedModel {
    constructor(spid, customerId, source, assignment){
        this.channel_number = null; // todo 1
        this.eventType = WebhookEventType.ConversationCreated;
        //this.SP_ID = spid || null;
        this.source =  source || 'system' ;  //user name>/system/incoming
        // this.action = "Conversation Created";
        this.assignment = assignment || "System";  //user name>/bot/unassigned
        this.customerId = customerId || null;
    }
  }

//   class base { // todo I will make a base class but in an architecture to extend some properties like spid, isDeleted, upadtedAt, createdAt etc
//     constructor(spid , eventType) {
//       this.eventType = eventType || null;
//       this.SP_ID = spid || null;
//     }
//   }
  
  module.exports = { ContactsAdded, contactBulkUpdate, deleteContactsModel, 
                     MessageReceivedModel, MessageStatusModel, conversationStatusModel, 
                     conversationAssignedModel, templateStatusModel, conversationCreatedModel };