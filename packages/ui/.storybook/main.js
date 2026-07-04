import path from 'node:path';

const config = {
  framework: {
    name: '@storybook/tanstack-react',
    options: {},
  },
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  viteFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        core: path.resolve(import.meta.dirname, '../../core/src'),
      },
    };
    return config;
  },
};

export default config;
