const subscribedEventsPayloads = [
  {
    event_type: "contact.created",
    contact_creator: "john_doe", // or 'system'
    contact_id: "c12345",
    customer_number: "919812345678",
    customer_name: "Alice Sharma",
    email_id: "alice@example.com",
    contact_owner: "support_team",
    tags: ["lead", "whatsapp"],
    optin_status: true,
    block: false,
    custom_attributes: {
      location: "Delhi",
      source: "Campaign A"
    }
  },
  {
    event_type: "contact.updated",
    contact_updater: "system",
    contact_id: "c12345",
    customer_number: "919812345678",
    customer_name: "Alice Sharma",
    email_id: "alice@example.com",
    contact_owner: "sales_team",
    tags: ["customer"],
    optin_status: true,
    block: false,
    custom_attributes: {
      last_seen: "2025-07-18"
    }
  },
  {
    event_type: "contact.deleted",
    delete_initiator: "admin_user",
    contact_id: "c12345",
    customer_number: "919812345678"
  },
  {
    event_type: "contact.bulkupdate",
    contact_updater: "admin_user",
    contacts: [
      {
        contact_id: "c12345",
        customer_number: "919812345678",
        customer_name: "Alice Sharma",
        email_id: "alice@example.com",
        contact_owner: "sales_team",
        tags: ["VIP"],
        optin_status: true,
        block: false,
        custom_attributes: {
          source: "Excel Import"
        }
      },
      {
        contact_id: "c54321",
        customer_number: "919876543210",
        customer_name: "Bob Singh",
        email_id: "bob@example.com",
        contact_owner: "support_team",
        tags: ["new"],
        optin_status: false,
        block: false,
        custom_attributes: {
          region: "South"
        }
      }
    ]
  },
  {
    event_type: "message.received",
    channel_number: "919812345678",
    customer_number: "919812345678",
    customer_name: "Alice Sharma",
    message_id: "m98765",
    message_time: "2025-07-18T14:00:00Z",
    quoted_id: null,
    message_type: "text",
    message_text: "Hello there!",
    media_type: null,
    mime_type: null,
    media_url: null
  },
  {
    event_type: "message.status",
    channel_number: "919812345678",
    customer_number: "919812345678",
    message_id: "m98765",
    message_time: "2025-07-18T14:01:00Z",
    status: "delivered",
    error_code: null,
    error_title: null
  },
  {
    event_type: "message.flow.received",
    channel_number: "919812345678",
    customer_number: "919812345678",
    customer_name: "Alice Sharma",
    message_id: "m11111",
    message_time: "2025-07-18T14:02:00Z",
    flow: {
      flow_id: "f123",
      flow_name: "Order Confirmation",
      steps_completed: ["welcome", "order_details"]
    }
  },
  {
    event_type: "conversation.created",
    channel_number: "919812345678",
    customer_number: "919812345678",
    source: "system",
    status: "open",
    assignment: "bot"
  },
  {
    event_type: "conversation.status.update",
    channel_number: "919812345678",
    customer_number: "919812345678",
    source: "admin_user",
    status: "resolved"
  },
  {
    event_type: "conversation.assignment.update",
    channel_number: "919812345678",
    customer_number: "919812345678",
    source: "system",
    status: "support_agent"
  },
  {
    event_type: "template.status",
    channel_number: "919812345678",
    template_id: "temp_001",
    template_name: "Welcome Template",
    status: "approved"
  }
];

module.exports = subscribedEventsPayloads;