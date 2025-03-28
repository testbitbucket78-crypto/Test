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
                return new CreateChannelResponse(result[0]);
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
        return this.event?.event === 'delete' && this.user?.id;
    }
    isAuthenticationEvent() {
        return this.event?.event === 'post' && this.health?.status?.text === 'AUTH';
    }
}

class WhapiMessageRequest {
    constructor({
        to,
        body,
        media = undefined,
    }) {
        this.to = to;
        this.body = body;
        if(media )this.media = media;
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

module.exports = {
    CreateChannelRequest,
    CreateChannelResponse,
    extendChannelValidity,
    WhapiIncomingMessage,
    WhapiMessageRequest,
    WhapiMessageResponse
};
