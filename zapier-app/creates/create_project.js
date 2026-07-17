const sample = require('../samples/create_project.json');

const perform = async (z, bundle) => {
  const response = await z.request({
    url: '/api/zapier/create-project',
    method: 'POST',
    body: {
      name: bundle.inputData.name,
      clientEmail: bundle.inputData.client_email,
      clientName: bundle.inputData.client_name,
      description: bundle.inputData.description,
    },
  });

  return response.data;
};

module.exports = {
  key: 'create_project',
  noun: 'Project',

  display: {
    label: 'Create Project',
    description: 'Creates a new project in PortalFlow.',
  },

  operation: {
    perform,

    inputFields: [
      { key: 'name', label: 'Project Name', type: 'string', required: true },
      { key: 'client_email', label: 'Client Email', type: 'string' },
      { key: 'client_name', label: 'Client Name', type: 'string' },
      { key: 'description', label: 'Description', type: 'text' },
    ],

    sample,

    outputFields: [
      { key: 'id', label: 'Project ID' },
      { key: 'name', label: 'Project Name' },
      { key: 'client_email', label: 'Client Email' },
      { key: 'client_name', label: 'Client Name' },
      { key: 'project_url', label: 'Project URL' },
    ],
  },
};
