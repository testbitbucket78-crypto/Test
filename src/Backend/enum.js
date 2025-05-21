const MessagingLimitTiers = {
    TIER_50: 50,
    TIER_250: 250,
    TIER_1K: 1000,
    TIER_10K: 10000,
    TIER_100K: 100000,
    TIER_UNLIMITED: 'Unlimited',
};
const MessagingName = {
    api: "Engagekart",
    web: "Engagezilla",

};
const channelName = {
    api: "WhatsApp API",
    web: "WhatsApp Web",
}
const channelForSendingMessage = {
    api: "WhatsApp Official",
    web: "WhatsApp Web",
}

const channelsForTemplates = {
    api: "WA API",
    web: "WA Web",
}

const userStatus = {
Active : 1,
Paused : 4 ,
Invited: 3,
Disabled : 2,
Deleted : 5
}

const  WebhookEventType = {
    ContactCreated : 'contact.created',
    ContactUpdated : 'contact.updated',
    ContactDeleted : 'contact.deleted',
    ContactBulkUpdate : 'contact.bulkupdate',
    MessageReceived : 'message.received',
    MessageStatus : 'message.status',
    MessageFlowReceived : 'message.flow.received',
    ConversationCreated : 'conversation.created',
    ConversationOpen : 'conversation.open',
    ConversationResolved : 'conversation.resolved',
    ConversationAssigned : 'conversation.assigned',
    TemplateStatus : 'template.status',
  }

  const ConversationStatusMap = {
    Open: 'conversation.open',
    Resolved: 'conversation.resolved',
    Assigned: 'conversation.assigned',
    Created: 'conversation.created'
  };

module.exports = { MessagingLimitTiers, MessagingName, channelName, channelForSendingMessage, channelsForTemplates,userStatus, WebhookEventType, ConversationStatusMap }