const sample = require('../samples/message_created.json');

const perform = async (z, bundle) => {
  const response = await z.request({
    url: '/api/zapier/messages/recent',
    params: { limit: 25 },
  });

  // Zapier dedupes polling results on a top-level `id` field
  return response.data.map((item) => ({ id: item.message_id, ...item }));
};

module.exports = {
  key: 'message_created',
  noun: 'Message',

  display: {
    label: 'New Message',
    description: 'Triggers when a new message is posted on a project.',
  },

  operation: {
    type: 'polling',
    perform,

    sample,

    outputFields: [
      { key: 'id', label: 'Trigger ID' },
      { key: 'message_id', label: 'Message ID' },
      { key: 'project_id', label: 'Project ID' },
      { key: 'content', label: 'Message Content' },
      { key: 'user_email', label: 'Sender Email' },
      { key: 'created_at', label: 'Created At', type: 'datetime' },
      { key: 'project_name', label: 'Project Name' },
      { key: 'project_url', label: 'Project URL' },
    ],
  },
};
