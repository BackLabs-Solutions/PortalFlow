const sample = require('../samples/project_created.json');

const perform = async (z, bundle) => {
  const response = await z.request({
    url: '/api/zapier/projects/recent',
    params: { limit: 25 },
  });

  return response.data;
};

module.exports = {
  key: 'project_created',
  noun: 'Project',

  display: {
    label: 'New Project Created',
    description: 'Triggers when a new project is created in PortalFlow.',
  },

  operation: {
    type: 'polling',
    perform,

    sample,

    outputFields: [
      { key: 'id', label: 'Project ID' },
      { key: 'name', label: 'Project Name' },
      { key: 'client_email', label: 'Client Email' },
      { key: 'client_name', label: 'Client Name' },
      { key: 'description', label: 'Description' },
      { key: 'created_at', label: 'Created At', type: 'datetime' },
      { key: 'project_url', label: 'Project URL' },
    ],
  },
};
