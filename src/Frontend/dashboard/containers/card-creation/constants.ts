// constants.ts
export const MAX_OPTIONS = 20;
export const MAX_BUTTONS = 3;
export const MAX_SECTIONS = 5;
export const MAX_ROWS_PER_SECTION = 10;
export const MAX_CHARACTERS = 1024;

export const STRING_OPERATORS = [
  'contains', 
  'does not contain', 
  'equals', 
  'not equal to', 
  'starts with', 
  'does not start with'
];

export const NUMBER_OPERATORS = [
  'equals', 
  'not equal to', 
  'greater than', 
  'less than'
];

export const BOOLEAN_OPERATORS = ['is true', 'is false'];

export const DEFAULT_ACTIONS = [
  { icon: 'uil uil-share-alt', label: 'Assign Conversation to Agent', color: '#3b7ddd', modal: 'assignAgentModal' },
  { icon: 'uil uil-share-alt', label: 'Assign to Contact Owner', color: '#3b7ddd', modal: 'assigntoContactOwner' },
  { icon: 'uil uil-refresh', label: 'Unassign Conversation', color: '#5cac64', modal: 'UnassignConversation' },
  { icon: 'uil uil-refresh', label: 'Update Conversation Status', color: '#5cac64', modal: 'UpdateConversationStatus' },
  { icon: 'uil uil-refresh', label: 'Update Contact Attribute', color: '#5cac64', modal: 'UpdateContactAttribute' },
  { icon: 'uil uil-tag', label: 'Add Tags', color: '#d54c4c', modal: 'AddTags' },
  { icon: 'uil uil-tag', label: 'Remove Tag', color: '#d54c4c', modal: 'RemoveTag' },
  { icon: 'uil uil-schedule', label: 'Add Time Delay', color: '#5cac64', modal: 'TimeDelayModal' },
  { icon: 'uil uil-bolt', label: 'Trigger Bot', color: '#e67e22', modal: 'BotTriggerModal' },
  { icon: 'uil uil-bolt', label: 'Message Opt-in', color: '#16a085', modal: 'MessageOptin' },
  { icon: 'uil uil-funnel', label: 'Notify', color: '#8e44ad', modal: 'NotificationModal' }
];

export const DEFAULT_TOOLS = {
  items: ['Bold', 'Italic', 'StrikeThrough', 'EmojiPicker']
};

export const PASTE_CLEANUP_SETTINGS = {
  prompt: false,
  plainText: true,
  keepFormat: false
};