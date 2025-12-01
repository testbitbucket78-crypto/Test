const db = require('../dbhelper'); 
const { ServerType, ProviderType } = require('../enum');

class ProviderService {
    constructor() {
        this.cache = {
            [ServerType.WHAPI]: new Set(),
            [ServerType.WEBJS]: new Set(),
        };

        this.providerToServerMap = {
            [ProviderType.WHAPI]: ServerType.WHAPI,
            [ProviderType.WEBJS]: ServerType.WEBJS,
        };
    }

    async fetchSPIDs(serverType) {
        const rows = await db.excuteQuery(
            `SELECT SP_ID 
             FROM user 
             WHERE server_type = ? 
               AND isDeleted != 1 
               AND IsActive != 2`,
            [serverType]
        );
        return rows.map(r => String(r?.SP_ID));
    }

    async refresh(providerType) {
        const serverType = this.providerToServerMap[providerType];
        if (!serverType) {
            throw new Error(`Unsupported provider type: ${providerType}`);
        }

        this.cache[serverType] = new Set(await this.fetchSPIDs(serverType));
    }

    async isValidSPID(provider, spid) {
        spid = String(spid);

        if (!Object.values(ProviderType).includes(provider)) {
            throw new Error(`This could be a new Provide Please Map this in our Service: ${provider}`);
        }

        const serverType = this.providerToServerMap[provider];

        if (this.cache[serverType].has(spid)) {
            return true;
        }

        await this.refresh(provider);
        return this.cache[serverType].has(spid);
    }
}

module.exports = new ProviderService();