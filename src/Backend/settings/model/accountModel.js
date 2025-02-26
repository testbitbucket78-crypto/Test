const db = require("../../dbhelper");
class APIKeyManager {
    constructor({ spId, ip, isSave, isEnabled, webhookURL, apiKey, isRegenerate, tokenName}) {
        this.spId = spId || null;
        this.ip = ip || null;
        this.isSave = isSave || false;
        this.isEnabled = typeof isEnabled === "number" ? isEnabled : 0;
        this.webhookURL = webhookURL || null;
        this.apiKey = apiKey || null;
        this.isRegenerate = isRegenerate || false;
        this.tokenName = tokenName || null;
    }
  
    validate() {
      if (!this.spId) {
        throw new Error("spId is the required fields");
      }
    }
    generateKey(prefix = "key") {
        try {
          const randomPart = Math.random().toString(36).substring(2, 12);
          const timestamp = Date.now();
      
          this.apiKey = `${prefix}-${randomPart}-${timestamp}`;
      
          return this.apiKey;
        } catch (error) {
          throw new Error("Failed to generate API key");
        }
      }

       mapResponse(data) {
        return {
            id: data.id || null,
            spId: data.spid || null,
            apiKey: data.api_key || null,
            isEnabled: data.is_enabled === 1, 
            webhookURL: data.webhook_url || null,
            ips: typeof data.ips === 'string' ? JSON.parse(data.ips) : data.ips || [],
            createdAt: data.created_at ? new Date(data.created_at) : null,
            updatedAt: data.updated_at ? new Date(data.updated_at) : null,
            tokenName: data.tokenName || null,
        };
    }
  }
  class spPhoneNumber {
    constructor({ ...args }) {
      this.spNumber = args?.spNumber || null;
    }
  
    validate() {
      if (!this.spNumber) {
        throw new Error("spNumber is a required field");
      }
    } 
    async getSPIDFromSPNumber(spNumber){
      try {
        const query = 'SELECT * FROM user WHERE  (registerPhone = ? OR mobile_number = ?) and isDeleted !=1 and IsActive !=2 and ParentId is null';
        const result = await db.excuteQuery(query, [spNumber, spNumber]);
        if (result && result.length > 0) {
          return result[0].SP_ID;
        } else {
          throw new Error(`SP ID not found for spNumber: ${spNumber}`);
        }

      } catch (err) {
        console.error('Error fetching SP ID:', err?.message);
      }
    }

  }
class sendMessageBody {
  constructor({ spId, PhoneNo, AgentId, CustomerId, InteractionId, message_text, media_type, message_media,
    template_id, quick_reply_id, message_type, created_at, mediaSize, spNumber, assignAgent, MessageVariables,
    headerText, bodyText, buttonsVariable, Message_id, messageTo, optInStatus, title, isTemplate, action, action_at
    ,action_by, uidMentioned, name, language, buttons, hasMedia, templateDetails, mediaDetails
   }) {
    this.SPID = spId || null;
    this.phoneNo = PhoneNo;
    this.AgentId = AgentId || null;
    this.CustomerId = CustomerId;
    this.InteractionId = InteractionId;
    this.message_text = message_text;
    this.message_direction = 'Out';

    this.media_type = hasMedia ? mediaDetails?.media_type : 'text';
    this.message_media = hasMedia ? mediaDetails?.message_media : 'text';

    this.template_id = template_id;
    this.quick_reply_id = quick_reply_id;
    this.message_type = message_type;
    this.created_at =  created_at ? new Date(created_at).toISOString() : new Date().toISOString();
    this.mediaSize = mediaSize;
    this.spNumber = spNumber;
    this.assignAgent = -3;
    this.MessageVariables = typeof MessageVariables == 'string' ? MessageVariables : JSON.stringify(MessageVariables);
    this.headerText = headerText;
    this.bodyText = bodyText;
    this.buttonsVariable = isTemplate ? templateDetails?.buttonsVariable : [];
    this.Message_id = "";
    this.messageTo = messageTo;
    this.optInStatus = optInStatus;
    this.title = title;
    this.isTemplate = isTemplate;
    this.action = action;
    this.action_at = action_at;
    this.action_by = action_by;
    this.uidMentioned = uidMentioned;
    this.name = isTemplate ? templateDetails?.name : '';
    this.language = language;
    this.buttons = isTemplate ? templateDetails?.buttons : [];
  }

  static async getBodyText(name) {
  let BodyText = '', FooterText = '';
    if (name) {
      try {
        const query = 'SELECT * FROM templateMessages WHERE TemplateName = ? AND isDeleted != 1';
        const result = await db.excuteQuery(query, [name]);

        if (result && result.length > 0) {
          BodyText = result[0].BodyText; 
          FooterText = result[0].FooterText;
        } else {
          throw new Error(`Template not found for Name: ${name}`);
        }
      } catch (err) {
        console.error('Error fetching template:', err.message);
      }
    }

    return { BodyText, FooterText };
  }
}

class ApiResponse {
  constructor({ status, insertId, middlewareresult }) {
    this.status = status || 500;
    this.insertId = insertId || null;
    this.response = this.isSuccess(status) ? new MiddlewareResult(middlewareresult) : null;
  }

  isSuccess(status) {
    return status >= 200 && status < 300;
  }
}

class MiddlewareResult {
  constructor({ status, message, msgId }) {
    this.status = status || null;
    this.messagingProduct = message?.messaging_product || 'whatsapp';
    this.contacts = message?.contacts?.map(contact => new Contact(contact)) || [];
    this.messageId = message?.messages?.length ? message.messages[0].id : msgId || null; 
  }
}

class Contact {
  constructor({ input, wa_id }) {
    this.inputNumber = input || null;
    this.whatsappId = wa_id || null;
  }
}

// Middleware function to process the response


  
  module.exports = {APIKeyManager, sendMessageBody, spPhoneNumber, ApiResponse};