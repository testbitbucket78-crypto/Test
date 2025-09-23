// config/serviceUrls.js

const envFile = `${process.env.NODE_ENV || 'staging'}.env`;
const var2 = require('dotenv').config({ path: envFile });

console.log(var2,'---------------------------------------var2------------------');

const env = process.env.NODE_ENV;

// const env = process.env;

// Defaults per env (optional)



const config = {
  env,
  waweb: process.env.waweb,
  contacts: process.env.contacts,
  settings: process.env.settings,
  auth: process.env.auth,
  webhook: process.env.webhook,
  socket: process.env.socket,
  redisIp: process.env.redisIp,
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  EngagekartEmail: process.env.EngagekartEmail,
  EngagekartEmailPassword: process.env.EngagekartEmailPassword,
  EngagekartEmailHost: process.env.EngagekartEmailHost,
  EngagekartPort: process.env.EngagekartPort,
  EngagezillaEmail: process.env.EngagezillaEmail,
  EngagezillaEmailPassword: process.env.EngagezillaEmailPassword,
  EngagezillaEmailHost: process.env.EngagezillaEmailHost,
  EngagezillaPort: process.env.EngagezillaPort,
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
