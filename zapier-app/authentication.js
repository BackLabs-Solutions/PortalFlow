const getMe = async (z, bundle) => {
  const response = await z.request({
    url: `${process.env.BASE_URL || 'https://portalflow.onrender.com'}/api/zapier/me`,
  });

  return response.data;
};

module.exports = {
  type: 'custom',

  fields: [
    {
      key: 'api_key',
      label: 'API Key',
      required: true,
      type: 'password',
      helpText:
        'Find your API key in PortalFlow under **Settings → Integrations → Zapier**. It starts with `pk_`.',
    },
  ],

  test: getMe,

  // References a top-level field of the object returned by `test` above
  connectionLabel: '{{email}}',
};
