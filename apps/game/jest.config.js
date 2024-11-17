/** @type {import('jest').Config} */
module.exports = {
  ...require('@sworld/jest-dom-preset'),
  setupFiles: ['<rootDir>/test/setup.js'],
};
