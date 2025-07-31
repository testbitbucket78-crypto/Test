// config/serviceUrls.js
const env = process.env;

// Defaults per env (optional)
const DEFAULTS = {
  development: {
    waweb: 'https://waweb.stacknize.com',
    auth: 'https://authapi.stacknize.com', 
    contacts: 'https://contactapi.stacknize.com', 
    settings: 'https://settings.stacknize.com', 
    webhook: 'https://call.stacknize.com/webhook'
  },
  preprod: {
    waweb: 'https://waweb-preprod.engagekart.com',
    auth: 'https://authapi-preprod.engagekart.com', 
    contacts: 'https://contactapi-preprod.engagekart.com', 
    settings: 'https://settings-preprod.engagekart.com', 
    webhook: 'https://call-preprod.engagekart.com/webhook'
  },
  production: {
    waweb: 'https://waweb.engagekart.com',
    auth: 'https://authapi.engagekart.com', 
    contacts: 'https://contactapi.engagekart.com', 
    settings: 'https://settings.engagekart.com', 
    webhook: 'https://call.engagekart.com/webhook'
  },
};

// Allow .env to override defaults
const base = DEFAULTS[env] || DEFAULTS.development;
const config = {
  env,
  waweb: process.env.waweb || base.waweb,
  contacts: process.env.contacts || base.contacts,
  settings: process.env.settings || base.settings,
  auth: process.env.auth || base.auth,
  webhook: process.env.webhook || base.webhook,
};

// Helper to fetch a URL by service name
function getUrl(service) {
  if (!(service in config)) {
    throw new Error(`Unknown service "${service}". Add it in config/serviceUrls.js`);
  }
  return config[service];
}

module.exports = { ...config, getUrl };
