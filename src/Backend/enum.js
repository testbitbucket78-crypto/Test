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

module.exports = { MessagingLimitTiers, MessagingName, channelName, channelForSendingMessage, channelsForTemplates }