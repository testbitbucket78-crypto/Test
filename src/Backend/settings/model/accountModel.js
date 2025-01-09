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
        };
    }
  }

class sendMessageBody {
  constructor({ spId, PhoneNo, AgentId, CustomerId, InteractionId, message_text, media_type, message_media,
    template_id, quick_reply_id, message_type, created_at, mediaSize, spNumber, assignAgent, MessageVariables,
    headerText, bodyText, buttonsVariable, Message_id, messageTo
   }) {
    this.SPID = spId || null;
    this.phoneNo = PhoneNo;
    this.AgentId = AgentId || null;
    this.CustomerId = CustomerId;
    this.InteractionId = InteractionId;
    this.message_text = message_text;
    this.message_direction = 'Out';
    this.media_type = media_type;
    this.message_media = message_media;
    this.template_id = template_id;
    this.quick_reply_id = quick_reply_id;
    this.message_type = message_type;
    this.created_at = new Date();
    this.mediaSize = mediaSize;
    this.spNumber = spNumber;
    this.assignAgent = -3;
    this.MessageVariables = typeof MessageVariables == 'string' ? MessageVariables : JSON.stringify(MessageVariables);
    this.headerText = headerText;
    this.bodyText = bodyText;
    this.buttonsVariable = buttonsVariable;
    this.Message_id = Message_id;
    this.messageTo = messageTo
  }
}
  
  module.exports = {APIKeyManager, sendMessageBody};