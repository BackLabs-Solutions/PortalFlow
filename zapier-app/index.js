const authentication = require('./authentication');

const projectCreated = require('./triggers/project_created');
const itemApproved = require('./triggers/item_approved');
const messageCreated = require('./triggers/message_created');

const createProject = require('./creates/create_project');

const BASE_URL = process.env.BASE_URL || 'https://portalflow.onrender.com';

const addApiKeyHeader = (request, z, bundle) => {
  if (bundle.authData.api_key) {
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${bundle.authData.api_key}`;
  }
  return request;
};

const handleErrors = (response, z, bundle) => {
  if (response.status === 401) {
    throw new z.errors.Error(
      'Your API key is invalid or has been revoked. Reconnect your PortalFlow account.',
      'AuthenticationError',
      response.status
    );
  }

  if (response.status >= 400) {
    const body = response.json || {};
    throw new z.errors.Error(
      body.error || `Unexpected error from PortalFlow (status ${response.status})`,
      'UnexpectedError',
      response.status
    );
  }

  return response;
};

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  beforeRequest: [
    (request, z, bundle) => {
      request.url = request.url.startsWith('http') ? request.url : `${BASE_URL}${request.url}`;
      return request;
    },
    addApiKeyHeader,
  ],

  afterResponse: [handleErrors],

  authentication,

  triggers: {
    [projectCreated.key]: projectCreated,
    [itemApproved.key]: itemApproved,
    [messageCreated.key]: messageCreated,
  },

  searches: {},

  creates: {
    [createProject.key]: createProject,
  },

  resources: {},
};
