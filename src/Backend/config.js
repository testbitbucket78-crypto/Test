// config/serviceUrls.js

const envFile = `.env.${process.env.NODE_ENV || 'staging'}`;
require('dotenv').config({ path: envFile });

const env = process.env.NODE_ENV;

// const env = process.env;

// Defaults per env (optional)
const DEFAULTS = {
  development: {
    waweb: 'https://waweb.stacknize.com',
    auth: 'https://authapi.stacknize.com', 
    contacts: 'https://contactapi.stacknize.com', 
    settings: 'https://settings.stacknize.com', 
    webhook: 'https://call.stacknize.com/webhook',
    socket:  'ws://52.66.172.213:3010/',
    redisIp:  '52.66.172.213',
host: "sdpl-staging.cccfuev8blzt.ap-south-1.rds.amazonaws.com",
user: "cip_preprod",
password: "cip_preprod@123$",
database: "cip_preprod",
        EngagekartEmail :  "stagingnotification@engagekart.com",
        EngagekartEmailPassword :  "Notification@123",
        EngagekartEmailHost :  "mail.engagekart.com",
        EngagekartPort :  "465",
        EngagezillaEmail :  "stagingnotification@engagezilla.com",
        EngagezillaEmailPassword :  "Notification@123",
        EngagezillaEmailHost :  "mail.engagezilla.com",
        EngagezillaPort :  "465",
  },
  preprod: {
    waweb: 'https://waweb-preprod.engagekart.com',
    auth: 'https://authapi-preprod.engagekart.com', 
    contacts: 'https://contactapi-preprod.engagekart.com', 
    settings: 'https://settings-preprod.engagekart.com', 
    webhook: 'https://call-preprod.engagekart.com/webhook',
    socket:  'ws://13.126.51.107:3010/',
    redisIp: '13.126.51.107',
host: "cip-pre-prod.cnq0kiwmcdcv.ap-south-1.rds.amazonaws.com",
user: "cip_preprod",
password: "cip_preprod@123$",
database: "cip_preprod",
            EngagekartEmail :  "preprodnotification@engagekart.com",
        EngagekartEmailPassword :  "Notification@123",
        EngagekartEmailHost :  "mail.engagekart.com",
        EngagekartPort :  "465",
        EngagezillaEmail :  "preprodnotification@engagezilla.com",
        EngagezillaEmailPassword :  "Notification@123",
        EngagezillaEmailHost :  "mail.engagezilla.com",
        EngagezillaPort :  "465",
  },
  production: {
    waweb: 'https://waweb.engagekart.com',
    auth: 'https://authapi.engagekart.com', 
    contacts: 'https://contactapi.engagekart.com', 
    settings: 'https://settings.engagekart.com', 
    webhook: 'https://call.engagekart.com/webhook',
    socket:  'ws://3.108.230.82:3010/',
    redisIp: '3.108.230.82',
host: "cipprod.cnq0kiwmcdcv.ap-south-1.rds.amazonaws.com",
user: "cip_prod",
password: "cip_prod@123$",
database: "cip_prod",
        EngagekartEmail :  "notification@engagekart.com",
        EngagekartEmailPassword :  "Notification@123",
        EngagekartEmailHost :  "mail.engagekart.com",
        EngagekartPort :  "465",
        EngagezillaEmail :  "notification@engagezilla.com",
        EngagezillaEmailPassword :  "Notification@123",
        EngagezillaEmailHost :  "mail.engagezilla.com",
        EngagezillaPort :  "465",
  },
};



console.log("env", process.env.waweb);
// Allow .env to override defaults
const base = DEFAULTS[env] || DEFAULTS.development;
const config = {
  env,
  waweb: process.env.waweb || base.waweb,
  contacts: process.env.contacts || base.contacts,
  settings: process.env.settings || base.settings,
  auth: process.env.auth || base.auth,
  webhook: process.env.webhook || base.webhook,
  socket: process.env.socket || base.socket,
  redisIp: process.env.redisIp || base.redisIp,
  host: process.env.host || base.host,
  user: process.env.user || base.user,
  password: process.env.password || base.password,
  database: process.env.database || base.database,
  EngagekartEmail: process.env.EngagekartEmail || base.EngagekartEmail,
  EngagekartEmailPassword: process.env.EngagekartEmailPassword || base.EngagekartEmailPassword,
  EngagekartEmailHost: process.env.EngagekartEmailHost || base.EngagekartEmailHost,
  EngagekartPort: process.env.EngagekartPort || base.EngagekartPort,
  EngagezillaEmail: process.env.EngagezillaEmail || base.EngagezillaEmail,
  EngagezillaEmailPassword: process.env.EngagezillaEmailPassword || base.EngagezillaEmailPassword,
  EngagezillaEmailHost: process.env.EngagezillaEmailHost || base.EngagezillaEmailHost,
  EngagezillaPort: process.env.EngagezillaPort || base.EngagezillaPort,
};
console.log("Config:", config);

// Helper to fetch a URL by service name
function getUrl(service) {
  if (!(service in config)) {
    throw new Error(`Unknown service "${service}". Add it in config/serviceUrls.js`);
  }
  return config[service];
}

module.exports = { ...config, getUrl };
