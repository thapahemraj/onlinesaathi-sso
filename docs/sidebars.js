// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Platform Guides',
      items: [
        'user-guide',
        'developer-guide',
        'system-admin-guide',
      ],
    },
    {
      type: 'category',
      label: 'API Documentation',
      items: [
        'getting-started',
        'oauth-integration',
        'api-reference',
      ],
    },
  ],
};

export default sidebars;
