const { WebhookEventType } = require('../enum') //ConversationStatusMap
const moment = require('moment');
class ContactsAdded {
    constructor(payload, keys) {
      this.eventType = WebhookEventType.ContactCreated;
      this.data = {};
  
      keys.forEach((key) => {
        this.data[key] = payload[key];
      });
    }
  }

  class contactBulkUpdate {
    constructor(payload, keys, action) {
        this.eventType = WebhookEventType.ContactCreated;
        this.Action = action;
        this.data = {};
    
        keys.forEach((key) => {
          this.data[key] = payload[key];
        });
      }
  }

  class deleteContactsModel {
    constructor(payload) {
      this.eventType = WebhookEventType.ContactDeleted;
      this.SP_ID = payload.SP_ID;
      this.customerIds = Array.isArray(payload.customerId) ? payload.customerId : [payload.customerId];
    }
  }

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
      this.SP_ID = spid;
      this.sender = {
        phoneNo,
        contactName,
        countryCode,
        EcPhonewithoutcountryCode
      };
      this.receiver = {
        display_phone_number,
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
        timestamp
      };
    }
  }

  class MessageStatusModel {
    constructor(message, ack, spid) {
      this.eventType = WebhookEventType.MessageStatus;
      this.phoneNumber = message.to.replace(/@c\.us$/, "");
      this.statusCode = parseInt(ack); // 1 = sent, 2 = delivered, 3 = read
      this.messageId = message?._data?.id?.id || null;
      this.spid = spid;
  
      const rawTimestamp = new Date(message.timestamp * 1000).toUTCString();
      this.messageTime = moment.utc(rawTimestamp).format('YYYY-MM-DD HH:mm:ss');
  
      const nowUTC = new Date().toUTCString();
      this.lastModified = moment.utc(nowUTC).format('YYYY-MM-DD HH:mm:ss');
    }
  }

  class conversationStatusModel {
    constructor(spid, conversationStatus , InteractionId) {
        this.SP_ID = spid;
        this.eventType = conversationStatus;
        this.InteractionId = InteractionId;
      }
  }
  class conversationAssignedModel {
    constructor(args) {
      this.eventType = WebhookEventType.ConversationAssigned //'conversation.assigned';
      this.action = args.action || '';
      this.action_at = args.action_at || new Date().toISOString();
      this.action_by = args.action_by || '';
      this.AgentId = args.AgentId || null;
      this.InteractionId = args.InteractionId || null;
      this.lastAssistedAgent = args.lastAssistedAgent || null;
      this.MappedBy = args.MappedBy || null;
      this.SP_ID = args.SP_ID || '';
    }
  }

  class templateStatusModel {
    constructor(event, spid){
        this.eventType = WebhookEventType.TemplateStatus;
        this.SP_ID = spid || '';
        this.templateId = event?.message_template_id || null;
        this.status = event?.event || null;
    }
  }
 
  class conversationCreatedModel {
    constructor(spid, customerId){
        this.eventType = WebhookEventType.ConversationCreated;
        this.SP_ID = spid || null;
        this.action = "Conversation Created";
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