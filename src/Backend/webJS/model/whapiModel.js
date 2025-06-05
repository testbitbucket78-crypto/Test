const db = require('../../dbhelper');

class CreateChannelRequest {
    constructor({ ...args }) {
        if (!args?.name) throw new Error('name is required');
        if (!args?.projectId) throw new Error('projectId is required');

        this.name = args?.name;
        this.phone = args?.phone;
        this.projectId = args?.projectId || null;
        this.recurrentPaymentId = args?.recurrentPaymentId || null;
        this.prevRecurrentPaymentId = args?.prevRecurrentPaymentId || null;
    }
}

class CreateChannelResponse {
    constructor({ ...args }, spid, phoneNo) {
        this.spid = spid || null;
        this.phoneNo = phoneNo || null;
        this.apiUrl = args?.apiUrl;
        this.id = args?.id;
        this.creationTS = args?.creationTS ? new Date(args.creationTS) : null;
        this.ownerId = args?.ownerId;
        this.activeTill = args?.activeTill ? new Date(args.activeTill) : null;
        this.token = args?.token;
        this.server = args?.server;
        this.stopped = args?.stopped;
        this.status = args?.status;
        this.name = args?.name;
        this.phone = args?.phone;
        this.projectId = args?.projectId;
    }

    async saveToDatabase() {
        try {
            const query = `
                INSERT INTO whapi_channels (id, api_url, creation_ts, owner_id, active_till, token, server, stopped, status, name, phone, project_id, spid, phone_no)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                api_url = VALUES(api_url),
                creation_ts = VALUES(creation_ts),
                owner_id = VALUES(owner_id),
                active_till = VALUES(active_till),
                token = VALUES(token),
                server = VALUES(server),
                stopped = VALUES(stopped),
                status = VALUES(status),
                name = VALUES(name),
                phone = VALUES(phone),
                project_id = VALUES(project_id),
                spid = VALUES(spid),
                phone_no = VALUES(phone_no);
            `;

            const values = [
                this.id,
                this.apiUrl,
                this.creationTS,
                this.ownerId,
                this.activeTill,
                this.token,
                this.server,
                this.stopped,
                this.status,
                this.name,
                this.phone,
                this.projectId,
                this.spid,
                this.phoneNo,
            ];

            const result = await db.excuteQuery(query, values);

            console.log('Channel saved successfully:', result);
            return true;
        } catch (error) {
            console.error('Error inserting channel into database:', error.message);
            return false;
        }
    }

    async deleteFromDatabase() {
        try {
            const query = 'DELETE FROM whapi_channels WHERE id = ?';
            const result = await db.excuteQuery(query, [this.id]);
    
            console.log(`Channel with id ${this.id} deleted successfully.`, result);
            return true;
        } catch (error) {
            console.error(`Error deleting channel with id ${this.id}:`, error.message);
            return false;
        }
    }

    /**
     * Fetches a channel by ID from the database.
     * @param {string} channelId
     * @returns {Promise<CreateChannelResponse|null>}
     */
    static async getByChannelId(channelId) {
        try {
            const query = `SELECT * FROM whapi_channels WHERE id = ? LIMIT 1;`;
            const result = await db.excuteQuery(query, [channelId]);

            if (result.length > 0) {
                return new CreateChannelResponse(result[0], result[0]?.spid, result[0]?.phone_no);
            } else {
                console.log('No channel found for ID:', channelId);
                return null;
            }
        } catch (error) {
            console.error('Error fetching channel from database:', error.message);
            return null;
        }
    }

    /**
     * Fetches a channel by SPID from the database.
     * @param {string} spid
     * @returns {Promise<CreateChannelResponse|null>}
     */
    static async getBySpid(spid) {
        try {
            const query = `SELECT * FROM whapi_channels WHERE spid = ? ORDER BY created_at DESC LIMIT 1;`;
            const result = await db.excuteQuery(query, [spid]);

            if (result.length > 0) {
                return new CreateChannelResponse(result[0]);
            } else {
                console.log('No channel found for SPID:', spid);
                return null;
            }
        } catch (error) {
            console.error('Error fetching channel from database:', error.message);
            return null;
        }
    }

    static async setChannelAlreadyAuthenticated(spid) {
        try {
            await db.excuteQuery("UPDATE WhatsAppWeb SET channel_status = 1 WHERE spid = ?", [spid]);
        } catch (error) {
            console.error('Error fetching channel from database:', error.message);
            return null;
        }
    }
}

class extendChannelValidity {
    constructor({ amount = '', currency = '' } = {}) {
        this.days = 1; // Default 1 day
        this.comment = 'Extending channel validity';
        this.amount = amount;
        this.currency = currency;
    }
}

class Message {
    constructor(data) {
        this.id = data?.id;
        this.from_me = data?.from_me;
        this.type = data?.type;
        this.chat_id = data?.chat_id;
        this.timestamp = data?.timestamp;
        this.source = data?.source;
        this.device_id = data?.device_id;
        this.text = data?.text || {};
        this.from = data?.from;
        this.from_name = data?.from_name;
        this.image = data?.image || null;
    }
}

class Event {
    constructor(data) {
        this.type = data?.type;
        this.event = data?.event;
    }
}

class Status {
    constructor(data) {
        this.id = data?.id || '';
        this.code = data?.code || 0;
        this.status = data?.status || '';
        this.recipient_id = data?.recipient_id || '';
        this.timestamp = data?.timestamp || 0;
        this.text = data?.text || '';
    }
}
class User {
    constructor(data) {
        this.id = data.id || '';
        this.name = data.name || '';
    }
}
class Health {
    constructor(data) {
        this.start_at = data?.start_at || 0;
        this.uptime = data?.uptime || 0;
        this.status = new Status(data?.status || {});
        this.version = data?.version || '';
    }
}
class WhapiIncomingMessage {
    constructor(data) {
        this.messages = data.messages?.map(msg => new Message(msg)) || [];
        this.event = new Event(data?.event || {});
        this.channel_id = data?.channel_id || '';
        this.statuses = data.statuses?.map(status => new Status(status)) || [];

        this.user = data.user ? new User(data.user) : null;
        this.health = data?.health ? new Health(data.health) : null;
    }

    isUserDisconnected() {
        return this.health?.status?.code == 1 && this.health?.status?.text === 'INIT';
    }
    isAuthenticationEvent() {
        return this.event?.event === 'post' && this.health?.status?.text === 'AUTH';
    }
}

// class WhapiMessageRequest { // deprecated
//     constructor({
//         to,
//         body,
//         media = undefined,
//     }) {
//         this.to = to;
//         this.body = body;
//         if(media )this.media = media;
//     }
// }
class WhapiMessageRequest {
  constructor({ to, body, media = undefined }) {
    this.to = String(to);

    if (media) {
      this.media = media;
      this.caption = body; 
    } else {
      this.body = body;
    }
  }
}
class WhapiMessageResponse {
    constructor(success, status, msgId = null, message = null, error = null) {
        this.success = success;
        this.status = status;
        this.msgId = msgId;
        this.message = message;
        this.error = error;
    }

    static successResponse(apiResponse) {
        return new WhapiMessageResponse(
            true,
            200,
            apiResponse?.message?.id ?? null,
            apiResponse?.message ?? null
        );
    }

    static errorResponse(apiError) {
        return new WhapiMessageResponse(
            false,
            500,
            null,
            null,
            apiError?.error?.message ?? "Unknown error"
        );
    }
    
}
class WhapiInteractiveButtons {
    constructor(to, interactiveButtons, bodyText = '') {
      this.to = to;
      this.interactiveButtons = this.parseButtons(interactiveButtons);
      this.bodyText = bodyText;
    }
  
    parseButtons(buttons) {
        if (typeof buttons === 'string') {
          try {
            const parsed = JSON.parse(buttons);
      
            if (Array.isArray(parsed)) {
              return parsed;
            } else if (parsed && parsed.action && Array.isArray(parsed.action.buttons)) {
              return parsed.action.buttons;
            } else {
              throw new Error('Parsed interactiveButtons is not valid');
            }
          } catch (error) {
            throw new Error('Invalid interactiveButtons JSON string');
          }
        }
      
        if (Array.isArray(buttons)) {
          return buttons;
        } else if (buttons && buttons.action && Array.isArray(buttons.action.buttons)) {
          return buttons.action.buttons;
        }
      
        throw new Error('interactiveButtons must be an array or object with action.buttons');
      }
  
    buildPayload() {
      return {
        to: this.to,
        type: "button",
        body: {
          text: this.bodyText
        },
        action: {
          buttons: this.interactiveButtons.map((btn, index) => {
            const button = {
              id: `${index + 1}`,
              type: btn.type,
              title: btn.title
            };
  
            if (btn.type === 'copy' && btn.copy_code) {
              button.copy_code = btn.copy_code;
            }
  
            if (btn.type === 'call' && btn.phone_number) {
              button.phone_number = btn.phone_number;
            }
  
            if (btn.type === 'url' && btn.url) {
              button.url = btn.url;
            }
  
            return button;
          })
        }
      };
    }
  }

module.exports = {
    CreateChannelRequest,
    CreateChannelResponse,
    extendChannelValidity,
    WhapiIncomingMessage,
    WhapiMessageRequest,
    WhapiMessageResponse,
    WhapiInteractiveButtons
};
