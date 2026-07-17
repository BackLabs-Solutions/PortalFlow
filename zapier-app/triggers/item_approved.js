const sample = require('../samples/item_approved.json');

const perform = async (z, bundle) => {
  const response = await z.request({
    url: '/api/zapier/checklist/approved',
    params: { limit: 25 },
  });

  // Zapier dedupes polling results on a top-level `id` field
  return response.data.map((item) => ({ id: item.item_id, ...item }));
};

module.exports = {
  key: 'item_approved',
  noun: 'Checklist Item',

  display: {
    label: 'Client Approved Item',
    description: 'Triggers when a client approves a checklist item on a project.',
  },

  operation: {
    type: 'polling',
    perform,

    sample,

    // approved items have no `id` field by default — Zapier needs a
    // unique id per trigger result, so we map item_id to id.
    outputFields: [
      { key: 'id', label: 'Trigger ID' },
      { key: 'item_id', label: 'Checklist Item ID' },
      { key: 'project_id', label: 'Project ID' },
      { key: 'title', label: 'Item Title' },
      { key: 'approved_by', label: 'Approved By' },
      { key: 'approved_at', label: 'Approved At', type: 'datetime' },
      { key: 'project_name', label: 'Project Name' },
      { key: 'project_url', label: 'Project URL' },
    ],
  },
};
