// constants.ts
export const MAX_OPTIONS = 20;
export const MAX_BUTTONS = 3;
export const MAX_SECTIONS = 10;
export const MAX_ROWS_PER_SECTION = 10;
export const MAX_CHARACTERS = 15000;


export const ALLOWED_OPERATORS = [
    'contains',
    'does not contain',
    'not equal to',
    'starts with',
    'does not start with',
    'greater than',
    'less than'
];


export const STRING_OPERATORS = ['Is empty', 'Is not empty', 'Is equal to', 'Is not equal to', 'Contains', 'Does not contain', 'Starts with', 'Ends with']

export const NUMBER_OPERATORS = 
    ['Is empty', 'Is not empty', 'Is equal to', 'Is not equal to', 'Contains', 'Does not contain', 'Starts with', 'Ends with', 'Greater than', 'Less than']


export const BOOLEAN_OPERATORS = 
    ['Is empty', 'Is not empty', 'Yes', 'No']


export const SELECT_OPERATORS = 
    ['Is empty', 'Is not empty', 'Is equal to', 'Is not equal to']


export const MULTI_SELECT_OPERATORS = 
    ['Is empty', 'Is not empty', 'Is equal to', 'Is not equal to']


export const DATE_OPERATORS = 
    ['Is empty', 'Is not empty', 'Is equal to', 'Is not equal to', 'after', 'before']


export const TIME_OPERATORS = 
    ['Is empty', 'Is not empty', 'Is equal to', 'Is not equal to', 'after', 'before']




export const DEFAULT_ACTIONS = [
    { icon: 'assets/img/taglist/assign coversation to agent.svg', label: 'Assign Conversation to Agent', color: '#3b7ddd', modal: 'assignAgentModal' },
    { icon: 'assets/img/taglist/assign conversation to contact owner.svg', label: 'Assign to Contact Owner', color: '#3b7ddd', modal: 'assigntoContactOwner' },
    { icon: 'assets/img/taglist/Unassign  conversation.svg', label: 'Unassign Conversation', color: '#5cac64', modal: 'UnassignConversation' },
    { icon: 'assets/img/taglist/update status.svg', label: 'Update Conversation Status', color: '#5cac64', modal: 'UpdateConversationStatus' },
    { icon: 'assets/img/taglist/Update Contact Attribute.svg', label: 'Update Contact Attribute', color: '#5cac64', modal: 'UpdateContactAttribute' },
    { icon: 'assets/img/taglist/add tag.svg', label: 'Add Tags', color: '#d54c4c', modal: 'AddTags' },
    { icon: 'assets/img/taglist/remove tag.svg', label: 'Remove Tag', color: '#d54c4c', modal: 'RemoveTag' },
    { icon: 'assets/img/taglist/time delay.svg', label: 'Add Time Delay', color: '#5cac64', modal: 'TimeDelayModal' },
    { icon: 'assets/img/taglist/Trigger Bot.svg', label: 'Trigger Bot', color: '#e67e22', modal: 'BotTriggerModal' },
    { icon: 'assets/img/taglist/Message opt in.svg', label: 'Message Opt-in', color: '#16a085', modal: 'MessageOptin' },
    { icon: 'assets/img/taglist/Notify.svg', label: 'Notify', color: '#8e44ad', modal: 'NotificationModal' },
    { icon: 'assets/img/taglist/Working Hours.svg', label: 'Working Hours', color: '#8e44ad', modal: 'WorkingHoursModal' },
    { icon: 'assets/img/taglist/Notes and mention.svg', label: 'Notes And Mention', color: '#8e44ad', modal: 'NotesMentionModal' }
];


export const DEFAULT_TOOLS = {
    items: ['Bold', 'Italic', 'StrikeThrough', 'EmojiPicker']
};

export const PASTE_CLEANUP_SETTINGS = {
prompt: false,          // Don't ask user what to do
  plainText: true,        // Paste as plain text only
  keepFormat: false,      // Remove formatting
  cleanCss: true,         // Clean inline CSS
  deniedTags: ['style'],  // Remove <style> tags
  deniedAttrs: ['style']  // 
};


export const attributes = [
    {
        "displayName": "Name",
        "ActuallName": "Name"
    },
    {
        "displayName": "Phone_number",
        "ActuallName": "Phone_number"
    },
    {
        "displayName": "emailId",
        "ActuallName": "emailId"
    },
    {
        "displayName": "ContactOwner",
        "ActuallName": "ContactOwner"
    },
    {
        "displayName": "Date",
        "ActuallName": "column1"
    },
    {
        "displayName": "Time",
        "ActuallName": "column2"
    },
    {
        "displayName": "Select data type",
        "ActuallName": "column3"
    },
    {
        "displayName": "Multi select data type",
        "ActuallName": "column4"
    },
    {
        "displayName": "Select",
        "ActuallName": "column5"
    },
    {
        "displayName": "Multiselect",
        "ActuallName": "column6"
    },
    {
        "displayName": "switch",
        "ActuallName": "column7"
    },
    {
        "displayName": "test select",
        "ActuallName": "column8"
    }
]