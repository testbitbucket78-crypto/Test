const { WebhookEventType, messageAckStatus } = require('../enum') //ConversationStatusMap
const moment = require('moment');
// class ContactsAdded { // todo deprecated
//     constructor(payload, keys) {
//       this.eventType = WebhookEventType.ContactCreated;
//       this.contact_creator = 'System'; // default to 'System' if not provided
//       this.contact_id =  null; // default to null if not provided
//       this.data = {};
  
//       keys.forEach((key) => {
//         this.data[key] = payload[key];
//       });
//     }
//   }

  class ContactsAdded {
  constructor(payload, keys, customMappingArray) {
    this.eventType = WebhookEventType.ContactCreated;
    this.contact_creator = 'System';
    this.contact_id = null;
    this.data = {};

    const customMapping = {};
    if (Array.isArray(customMappingArray)) {
      customMappingArray.forEach((entry) => {
        customMapping[entry.actual_column_name] = entry.customized_column_name;
      });
    }

    keys.forEach((key) => {
       if (key === 'SP_ID') return;
       if (key === 'uid') return;
       if (key === 'CountryCode') return;
       if( key === 'Phone_number') return;
       
        const customizedKey = customMapping[key] || key;
        const rawValue = payload[key];

      switch (key) {
        case 'displayPhoneNumber':
          this.data.customer_number = payload[key];
          break;
        case 'Name':
          this.data.customer_name = payload[key];
          break;
        case 'emailId':
          this.data.email_id = payload[key];
          break;
        case 'ContactOwner':
          this.data.contact_owner = payload[key];
          break;
        case 'tag':
          this.data.tags = payload[key];
          break;
        case 'OptInStatus':
          this.data.optin_status = payload[key];
          break;
        default:
          //this.data[key] = payload[key];
          let cleanedValue = rawValue;
          if (typeof rawValue === 'string' && rawValue.includes(':') && rawValue.includes('_')) {
            const parts = rawValue.split(',').map(part => {
              const colonIndex = part.indexOf(':');
              return colonIndex !== -1 ? part.slice(colonIndex + 1) : part;
            });
            cleanedValue = parts.join(',');
          }

        this.data[customizedKey] = cleanedValue;
        // this.data[customizedKey] = payload[key];
      }
    });

    this.data.block = false;
  }
}

  // }
  // class contactBulkUpdate { todo deprecated
  //   constructor(payload, keys, action) {
  //     this.eventType = WebhookEventType.ContactBulkUpdate;
  //     this.Action = action || 'Bulk Upload';
  //     this.contact_updater = 'System'; // default to 'System' if not provided
  //     this.data = [];
  
  //     payload.data.forEach((row) => {
  //       const rowObj = {};
  //       keys.forEach((key, index) => {
          
  //         rowObj[key] = row[index];
  //       });
  //       this.data.push(rowObj);
  //     });
  //   }
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
        if (key === 'SP_ID') return;

        switch (key) {
          case 'displayPhoneNumber':
            rowObj.customer_number = row[index];
            break;
          case 'Name':
            rowObj.customer_name = row[index];
            break;
          case 'emailId':
            rowObj.email_id = row[index];
            break;
          case 'ContactOwner':
            rowObj.contact_owner = row[index];
            break;
          case 'tag':
            rowObj.tags = row[index];
            break;
          case 'OptInStatus':
            rowObj.optin_status = row[index];
            break;
          default:
            rowObj[key] = row[index];
        }
      });

      rowObj.block = false;
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

  // class MessageReceivedModel { todo deprecated
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
  //     //this.SP_ID = spid;
  //     this.channel_number = display_phone_number;
  //     this.sender = {
  //       phoneNo,
  //       contactName,
  //       countryCode,
  //       EcPhonewithoutcountryCode
  //     };
  //     this.receiver = {
  //       phoneNo: display_phone_number,
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
  //       timestamp,
  //       quoted_id: message_media?.quoted_id || null,
  //       mime_type: message_media?.mime_type || null,
  //     };
  //   }
  // }
  class MessageReceivedModel {
  constructor(
    spid,
    phoneNo,                  // customer_number (sender)
    message_direction,
    message_text,
    message_media,
    Message_template_id,
    Quick_reply_id,
    Type,                     // message_type (text/media/unknown)
    ExternalMessageId,        // message_id
    display_phone_number,     // channel_number (receiver)
    contactName,              // customer_name
    media_type,
    ackStatus,
    source,
    timestamp,                // message_time
    countryCode,
    EcPhonewithoutcountryCode,
    extra1,
    extra2,
    retryCount
  ) {
    this.channel_number = display_phone_number;
    this.event_type = WebhookEventType.MessageReceived;
    this.customer_number = phoneNo;
    this.customer_name = contactName;
    this.message_id = ExternalMessageId;
    this.message_time = timestamp;
    this.quoted_id = message_media?.quoted_id || null;
    this.message_type = Type || 'unknown';
    this.message_text = message_text || '';
    this.media_type = message_media?.media_type || media_type || null;
    this.mime_type = message_media || null;
    this.media_url = message_media?.media_url || null;
    ackStatus;
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
      //this.message_time = moment.utc(rawTimestamp).format('YYYY-MM-DD HH:mm:ss');
      this.message_time = moment(rawTimestamp).format('YYYY-MM-DD HH:mm:ss');
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
        this.Source = 'system'; // 'user name>/system/incoming'
        // this.eventType = conversationStatus;
        //this.InteractionId = InteractionId;
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
    constructor(spid, customerId, source, phoneNo){
        this.channel_number = null; // todo 1
        this.eventType = WebhookEventType.ConversationCreated;
        //this.SP_ID = spid || null;
        this.source =  source || 'system' ;  //user name>/system/incoming
        // this.action = "Conversation Created";
        this.assignment = "System";  //user name>/bot/unassigned
        this.customerId = customerId || null;
        this.customer_number = phoneNo;
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