const swaggerJSDoc = require('swagger-jsdoc');


const isServer = false;
const basePath = isServer ? '..' : 'src/Backend';

const swagger = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EngageKart API',
            version: '1.0.0',
            description: 'API documentation for EngageKart project.',
        },
        servers: [
            {
                url: 'http://localhost:3003',
                description: 'Development Server - Authentication',
            },
            {
                url: 'https://authapi.stacknize.com',
                description: 'Preprod Server - Authentication',
            },
            {
                url: 'http://localhost:3004',
                description: 'Development Server - Settings',
            },
            {
                url: 'https://settings.stacknize.com',
                description: 'Staging Server - Settings',
            },
            {
                url: 'http://localhost:3001',
                description: 'Development Server - Dashboard',
            },
            {
                url: 'https://cip-api.stacknize.com',
                description: 'Staging Server - Dashboard',
            },
            {
                url: 'http://localhost:3002',
                description: 'Development Server - Contacts',
            },
            {
                url: 'https://contactapi.stacknize.com',
                description: 'Staging Server - Contacts',
            },
            {
                url: 'http://localhost:3005',
                description: 'Development Server - Smart Replies',
            },
            {
                url: 'https://smartapi.stacknize.com',
                description: 'Staging Server - Smart Replies',
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'Endpoints related to Authentication Server',
            },
            {
                name: 'Settings',
                description: 'Endpoints related to Settings Server',
            },
            {
                name: 'Dashboard',
                description: 'Endpoints related to Dashboard Server',
            },
            {
                name: 'Contacts',
                description: 'Endpoints related to Contacts Server',
            },
            {
                name: 'Smart Replies',
                description: 'Endpoints related to Smart Replies Server',
            },
        ],
        
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        `${basePath}/SwaggerDocs/Auth/Auth.js`, // Authentication APIs
        
        `${basePath}/SwaggerDocs/Auth/login.js`, // Login APIs

        `${basePath}/settings/settingsRouter.js`, // Send Third Party API

        `${basePath}/SwaggerDocs/GeneralSetting/DefaultActions.js`, // Default Actions - Setting
        `${basePath}/SwaggerDocs/GeneralSetting/DefaultMessagesSetting.js`, // Default Messages - Setting
        `${basePath}/SwaggerDocs/GeneralSetting/RoutingRulesSetting.js`, // Routing Rules - Setting
        `${basePath}/SwaggerDocs/GeneralSetting/ManageStorageSetting.js`, // Manage Storage - Setting

        `${basePath}/SwaggerDocs/OrganizationalSetting/BusinessProfile.js`, // Organization - Setting
        `${basePath}/SwaggerDocs/OrganizationalSetting/WorkingHoursSetting.js`, // Working Hours - Setting
        `${basePath}/SwaggerDocs/OrganizationalSetting/RolesSetting.js`, // Roles - Setting
        `${basePath}/SwaggerDocs/OrganizationalSetting/UsersSettings.js`, // Users - Setting

        `${basePath}/SwaggerDocs/ContactSetting/CustomField.js`, // Contact - Setting
        `${basePath}/SwaggerDocs/ContactSetting/TagSetting.js`, // Tags - Setting

        `${basePath}/SwaggerDocs/CampaignSetting/CampaignSetting.js`, // Campaign Settings

        `${basePath}/SwaggerDocs/TemplateSetting/TemplateMessage.js`, // Template Messages & Gallery

        `${basePath}/SwaggerDocs/AccountSetting/ChannelSettings.js`, // Channel Settings

        `${basePath}/SwaggerDocs/Dashboard/Dashboard.js`, // Dashboard

        `${basePath}/SwaggerDocs/Contacts/Contacts.js`, // Contacts
        
        `${basePath}/SwaggerDocs/TeamBox/TeamBox.js`, // TeamBox

        `${basePath}/SwaggerDocs/SmartReplies/SmartReplies.js`, // Smart Replies

        `${basePath}/SwaggerDocs/Campaign/Campaign.js`, // Campaigns

        `${basePath}/SwaggerDocs/SendAPI/SendAPIForOfficial.js`,  // whatsApp Official
        //`${basePath}/SwaggerDocs/SendAPI/SendAPIForWeb.js`, // WhatsApp web
    ],
});

module.exports = swagger;