const db = require("../../dbhelper");
class APIKeyManager {
    constructor({ spId, ip, isSave, isEnabled, webhookURL, apiKey, isRegenerate, tokenName, isNew, id}) {
        this.id = id || null;
        this.spId = spId || null;
        this.ip = ip || null;
        this.isSave = isSave || false;
        this.isEnabled = typeof isEnabled === "number" ? isEnabled : 0;
        this.webhookURL = webhookURL || null;
        this.apiKey = apiKey || null;
        this.isRegenerate = isRegenerate || false;
        this.tokenName = tokenName || null;
        this.isNew = isNew;
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

      generateKey2(length = 32) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let key = '';
        for (let i = 0; i < length; i++) {
          key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
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
            apiToken: data.api_token || null,
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
  let BodyText = '', FooterText = '', Header = '';
    if (name) {
      try {
        const query = 'SELECT * FROM templateMessages WHERE TemplateName = ? AND isDeleted != 1';
        const result = await db.excuteQuery(query, [name]);

        if (result && result.length > 0) {
          BodyText = result[0].BodyText; 
          FooterText = result[0].FooterText;
          Header = result[0].Header;
        } else {
          throw new Error(`Template not found for Name: ${name}`);
        }
      } catch (err) {
        console.error('Error fetching template:', err.message);
      }
    }

    return { Header, BodyText, FooterText };
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
class Webhooks{
  constructor(args){
    this.id = args?.id;
    this.name = args?.name;
    this.url = args?.url;
    this.secret = args?.secret;
    this.channel = args?.channel;
    this.eventType = typeof args?.eventType === 'string' ? args.eventType : JSON.stringify(args?.eventType || []);
    this.spid = args?.spid;
    this.isEnabled =  args?.isEnabled || false;
    this.createdAt = args?.createdAt ? new Date(args?.createdAt) : new Date();
    this.updatedAt = new Date();
  }

  async saveOrUpdateToDatabase() {
    try {
      const query = `
        INSERT INTO Webhooks (id, name, url, secret, channel, event_type, spid, is_enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          url = VALUES(url),
          secret = VALUES(secret),
          channel = VALUES(channel),
          event_type = VALUES(event_type),
          spid = VALUES(spid),
          is_enabled = VALUES(is_enabled),
          updated_at = CURRENT_TIMESTAMP;
      `;

      const values = [
        this.id || null,
        this.name,
        this.url,
        this.secret,
        this.channel,
        this.eventType,
        this.spid,
        this.isEnabled,
      ];

      const result = await db.excuteQuery(query, values);
      console.log('Webhook saved or updated successfully:', result);
      return true;
    } catch (error) {
      console.error('Error saving or updating webhook:', error.message);
      return false;
    }
  }

  async getWebhookDetails() {
    try {
      const query = `SELECT * FROM Webhooks WHERE spid = ?`;
      const values = [this.spid];
      const result = await db.excuteQuery(query, values);
      const webhooks = result.map(row => ({
        id: row.id,
        name: row.name,
        url: row.url,
        secret: row.secret,
        channel: row.channel,
        eventType: row.event_type ? JSON.parse(row.event_type) : [],
        spid: row.spid,
        isEnabled: !!row.is_enabled,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
  
      return webhooks;

    } catch (error) {
      console.error('Error fetching webhook details:', error.message);
      return [];
    }
  }
  async deleteWebhook() {
    try {
      const query = `
        DELETE FROM Webhooks WHERE id = ?;
      `;
  
      let res = await db.excuteQuery(query, [this.id]);
      console.log(`Webhook with id ${this.id} deleted successfully.`);
      return res;
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw error;
    }
  }
}
class textMessageBody {
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
  let BodyText = '', FooterText = '', Header = '';
    if (name) {
      try {
        const query = 'SELECT * FROM templateMessages WHERE TemplateName = ? AND isDeleted != 1';
        const result = await db.excuteQuery(query, [name]);

        if (result && result.length > 0) {
          BodyText = result[0].BodyText; 
          FooterText = result[0].FooterText;
          Header = result[0].Header;
        } else {
          throw new Error(`Template not found for Name: ${name}`);
        }
      } catch (err) {
        console.error('Error fetching template:', err.message);
      }
    }

    return { Header, BodyText, FooterText };
  }
}

class mediaMessageBody {
  constructor({ spId, PhoneNo, AgentId, CustomerId, InteractionId, message_text, media_type, message_media,
    template_id, quick_reply_id, message_type, created_at, mediaSize, spNumber, assignAgent, MessageVariables,
    headerText, bodyText, buttonsVariable, Message_id, messageTo, optInStatus, title, isTemplate, action, action_at
    ,action_by, uidMentioned, name, language, buttons, hasMedia = true, templateDetails, mediaDetails
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
  let BodyText = '', FooterText = '', Header = '';
    if (name) {
      try {
        const query = 'SELECT * FROM templateMessages WHERE TemplateName = ? AND isDeleted != 1';
        const result = await db.excuteQuery(query, [name]);

        if (result && result.length > 0) {
          BodyText = result[0].BodyText; 
          FooterText = result[0].FooterText;
          Header = result[0].Header;
        } else {
          throw new Error(`Template not found for Name: ${name}`);
        }
      } catch (err) {
        console.error('Error fetching template:', err.message);
      }
    }

    return { Header, BodyText, FooterText };
  }
}

class TemplateStatus {
  constructor(spId, templateName) {
    this.spId = spId || null;
    this.templateName = templateName || null;
  }

  async getStatus() {
    if (!this.templateName) {
      throw new Error("templateName is required");
    }

    const query = `
      SELECT status 
      FROM templateMessages 
      WHERE spid = ? 
        AND isDeleted != 1 
        AND isTemplate = 1 
        AND templateName = ?
      LIMIT 1
    `;

    const result = await db.excuteQuery(query, [this.spId, this.templateName]);

    if (result && result.length > 0) {
      return result[0].status;
    } else {
      throw new Error("Template not found");
    }
  }
}
class SessionStatus {
  constructor(spId, customerId) {
    this.spId = spId || null;
    this.customerId = customerId || null;
  }

  async getSession() {
    if (!this.customerId) {
      throw new Error("templateName is required");
    }

    const query = `
      SELECT CONVERT_TZ(created_at, '+00:00', '+05:30') AS ist_time
      FROM Message 
      WHERE interaction_id = (
          SELECT InteractionId 
          FROM Interaction 
          WHERE customerId = ? 
          ORDER BY InteractionId DESC 
          LIMIT 1
      ) 
      AND message_direction = 'In' AND SPID = ?
      ORDER BY created_at DESC 
      LIMIT 1;
    `;

    const result = await db.excuteQuery(query, [this.customerId, this.spId]);

if (!result || result.length === 0) {
      throw new Error("No recent inbound message found");
    }

    const lastInboundTime = new Date(result[0].ist_time);
    const now = new Date();
    const timeDiffMs = now - lastInboundTime;
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

    const hoursLeft = Math.max(0, 24 - timeDiffHours);
    const sessionStatus = hoursLeft > 0 ? 'open' : 'closed';

    const fullHours = Math.floor(hoursLeft);
    const minutesLeft = Math.round((hoursLeft - fullHours) * 60);

    return {
      session: sessionStatus,
      hoursLeft: fullHours , minutesLeft,
      lastInboundTime: lastInboundTime.toISOString()
    };
  }
}

class TemplateAPI {
  constructor(body) {
    this.TemplateName = body.TemplateName;
    this.Category = body.Category;
    this.category_id = body.category_id;
    this.categoryChange = body.categoryChange;
    this.Language = body.Language;
    this.Header = body.Header;
    this.BodyText = body.BodyText;
    this.FooterText = body.FooterText;
    this.hasButtons = body.hasButtons;

    this.buttons = this.formatButtonsForAPI(body.buttons);

    this.interactiveButtonsPayload = '{"to":"","action":{"buttons":[]}}';
    this.Links = body.Links;
    this.media_type = body.media_type;
    this.isCopied = 0;
    this.isTemplate = 1;
    this.status = 'pending';
    this.created_By = body.created_By;
    this.ID = 0;
    this.template_id = 0;
    this.Channel = "WhatsApp Official";
    this.spid = 55;

    // 👇 Construct template_json
    this.template_json = [
      {
        name: body.TemplateName,
        category: body.Category,
        allow_category_change: body.categoryChange === 'Yes',
        language: this.mapLanguageCode(body.Language),
        components: this.buildComponents(body),
      },
    ];
  }

  mapLanguageCode(language) {
    const langMap = {
      English: 'en',
      Hindi: 'hi',
      Spanish: 'es',
    };
    return langMap[language] || 'en';
  }

  buildComponents(body) {
    const components = [];

    if (body.Header?.trim()) {
      components.push({
        type: 'HEADER',
        format: 'text',
        text: body.Header,
      });
    }

    if (body.BodyText?.trim()) {
      components.push({
        type: 'BODY',
        text: body.BodyText,
      });
    }

    if (body.FooterText?.trim()) {
      const cleanFooter = body.FooterText.replace(/<[^>]*>?/gm, '').trim();
      components.push({
        type: 'FOOTER',
        text: cleanFooter,
      });
    }

    const parsedButtons = this.parseButtons(this.buttons);
    if (parsedButtons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: parsedButtons,
      });
    }

    return components;
  }

formatButtonsForAPI(buttonsArray) {
  if (!Array.isArray(buttonsArray)) return '[]';

  const formatted = buttonsArray
    .map((btn) => {
      const cleanedBtn = {};

      const type = this.mapButtonTypeForUI(btn.type);
      if (type) cleanedBtn.type = type;
      if (btn.buttonText?.trim()) cleanedBtn.buttonText = btn.buttonText.trim();
      if (btn.url?.trim()) cleanedBtn.url = btn.url.trim();
      if (btn.CountryCode?.trim()) cleanedBtn.CountryCode = btn.CountryCode.trim();
      if (btn.phoneNumber?.trim()) cleanedBtn.phoneNumber = btn.phoneNumber.trim();
      if (btn.couponCode?.trim()) cleanedBtn.couponCode = btn.couponCode.trim();
      if (btn.flowId?.trim()) cleanedBtn.flowId = btn.flowId.trim();

      return Object.keys(cleanedBtn).length > 1 ? cleanedBtn : null;
    })
    .filter(Boolean); 

  return JSON.stringify(formatted);
}

  mapButtonTypeForUI(type) {
    const map = {
      QUICK_REPLY: 'Quick Reply',
      URL: 'Visit Website',
      'VISIT WEBSITE': 'Visit Website',
      PHONE: 'Phone',
      PHONE_NUMBER: 'Phone',
      COUPON_CODE: 'Coupon Code',
      FLOW: 'Flow',
    };
    return map[type?.toUpperCase()] || type;
  }

  parseButtons(buttonsString) {
    if (!buttonsString || typeof buttonsString !== 'string') return [];

    let parsed = [];
    try {
      parsed = JSON.parse(buttonsString);
    } catch (err) {
      console.warn('Failed to parse buttons JSON:', err);
      return [];
    }

    const mappedButtons = parsed.map((btn) => {
      const type = btn.type?.toUpperCase();

      switch (type) {
        case 'VISIT WEBSITE':
        case 'URL':
          return {
            type: 'URL',
            text: btn.buttonText,
            url: btn.url,
          };
        case 'PHONE':
        case 'PHONE_NUMBER':
          return {
            type: 'PHONE_NUMBER',
            text: btn.buttonText,
            phone_number: `${btn.phoneNumber}`.trim(),
          };
        case 'QUICK_REPLY':
        case 'QUICK REPLY':
          return {
            type: 'QUICK_REPLY',
            text: btn.buttonText,
          };
        case 'COUPON_CODE':
          return {
            type: 'COUPON_CODE',
            text: btn.buttonText,
            coupon_code: btn.couponCode,
          };
        case 'FLOW':
          return {
            type: 'FLOW',
            text: btn.buttonText,
            flow_id: btn.flowId,
          };
        default:
          return null;
      }
    });

    return mappedButtons.filter(Boolean);
  }
}
class TemplateWHAPI {
  constructor(body, spId) {
    this.TemplateName = body.TemplateName;
    this.Category = body.Category;
    this.category_id = body.category_id;
    this.categoryChange = body.categoryChange;
    this.Language = body.Language;
    this.Header = body.Header;
    this.BodyText = body.BodyText;
    this.FooterText = body.FooterText;
    this.hasButtons = body.hasButtons;
    this.Links = body.Links;
    this.media_type = body.media_type;
    this.created_By = body.created_By;
    this.spid = spId;
    this.ID = 0;
    this.template_id = 0;
    this.isCopied = 0;
    this.status = 'saved';
    this.Channel = "WhatsApp Web";
    this.isTemplate = 1
    this.interactiveButtonsPayload = this.buildInteractiveButtonsPayload(body.buttons || []);
  }

  buildInteractiveButtonsPayload(buttonsArray) {
    if (!Array.isArray(buttonsArray) || buttonsArray.length === 0) {
      return JSON.stringify({
        to: "",
        action: { buttons: [] },
      });
    }

    const finalButtons = buttonsArray.map((btn, index) => {
      const type = btn.type?.toUpperCase();
      const title = btn.buttonText?.trim() || `Button ${index + 1}`;
      const baseId = title.toLowerCase().includes('quick') ? 'quick_reply' :
                     title.replace(/\s+/g, '_').toLowerCase();

      switch (type) {
        case 'QUICK_REPLY':
          return {
            type: 'quick_reply',
            title,
            id: 'quick_reply',
          };
        case 'URL':
          return {
            type: 'url',
            title,
            url: btn.url,
          };
        case 'PHONE':
          return {
            type: 'call',
            title,
            phone_number: btn.phoneNumber,
          };
        case 'LIST_MESSAGE':
          return {
            type: 'list',
            title,
            options: btn.listOptions || [],
          };
        case 'COPY_BUTTON':
          return {
            type: 'copy',
            id: 'copy_button',
            title: 'copy button text',
            copy_code: btn.copyCode,
          };
        default:
          return null;
      }
    });

    return JSON.stringify({
      to: "",
      action: {
        buttons: finalButtons.filter(Boolean),
      },
    });
  }
}
class TemplateWEB {
  constructor(body, spId) {
    this.TemplateName = body.TemplateName;
    this.Category = body.Category;
    this.category_id = body.category_id;
    this.categoryChange = body.categoryChange;
    this.Language = body.Language;
    this.Header = body.Header;
    this.BodyText = body.BodyText;
    this.FooterText = body.FooterText;
    this.hasButtons = false;
    this.Links = body.Links;
    this.media_type = body.media_type;
    this.created_By = body.created_By;
    this.spid = spId;
    this.ID = 0;
    this.template_id = 0;
    this.isCopied = 0;
    this.status = 'saved';
    this.Channel = "WhatsApp Web";
    this.isTemplate = 1
    this.interactiveButtonsPayload = [];
  }
}

class Template {
  constructor(body, spid){
    this.spid = spid;
    this.templateName = body.TemplateName;
  }

  async getTemplateDetails() {
    if (!this.templateName) {
      throw new Error("templateName is required");
    }

    const query = `
      SELECT * FROM templateMessages WHERE spid = ? and TemplateName = ? AND isDeleted != 1`;

    const result = await db.excuteQuery(query, [this.spid, this.templateName]);

    if (result && result.length > 0) {
      return result[0];
    } else {
      throw new Error("Template not found");
    }
  }
}

class sendTemplateBody {
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
    this.isTemplate = templateDetails.isTemplate;
    this.action = action;
    this.action_at = action_at;
    this.action_by = action_by;
    this.uidMentioned = uidMentioned;
    this.name = templateDetails.isTemplate ? templateDetails?.TemplateName : '';
    this.language = templateDetails?.Language;
    this.buttons = templateDetails.isTemplate 
      ? (typeof templateDetails?.buttons === 'string'
      ? JSON.parse(templateDetails.buttons)
      : templateDetails?.buttons || [])
      : [];
  }

static async getBodyText(name) {
  let BodyText = '', FooterText = '', Header = '';
    if (name) {
      try {
        const query = 'SELECT * FROM templateMessages WHERE TemplateName = ? AND isDeleted != 1';
        const result = await db.excuteQuery(query, [name]);

        if (result && result.length > 0) {
          BodyText = result[0].BodyText; 
          FooterText = result[0].FooterText;
          Header = result[0].Header;
        } else {
          throw new Error(`Template not found for Name: ${name}`);
        }
      } catch (err) {
        console.error('Error fetching template:', err.message);
      }
    }

    return { Header, BodyText, FooterText };
  }
}
  module.exports = {APIKeyManager, sendMessageBody, spPhoneNumber, ApiResponse, Webhooks, textMessageBody, mediaMessageBody, TemplateStatus
    , SessionStatus, TemplateAPI, TemplateWHAPI, TemplateWEB, Template, sendTemplateBody
  };