const { WebhookEventType } = require('../enum')

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
  
  module.exports = { ContactsAdded, contactBulkUpdate, deleteContactsModel };