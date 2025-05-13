export interface WebhookEventGroup {
    label: string;
    events: {
      label: string;
      value: WebhookEventType;
    }[];
  }

  export enum WebhookEventType {
    ContactCreated = 'contact.created',
    ContactUpdated = 'contact.updated',
    ContactDeleted = 'contact.deleted',
    MessageReceived = 'message.received',
    MessageStatus = 'message.status',
    MessageFlowReceived = 'message.flow.received',
    ConversationCreated = 'conversation.created',
    ConversationOpen = 'conversation.open',
    ConversationResolved = 'conversation.resolved',
    ConversationAssigned = 'conversation.assigned',
    TemplateStatus = 'template.status'
  }

  export interface WebhookPayload {
    id?: number;
    name: string;
    url: string;
    secret: string;
    channel: string;
    eventType: string[];
    spid: number;
    isEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }