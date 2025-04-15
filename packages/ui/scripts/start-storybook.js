#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');

// Define paths
const storybookConfigDir = path.join(__dirname, '../.storybook');
const outputDir = path.join(__dirname, '../storybook-static');

console.log('Starting Storybook...');
console.log(`Config directory: ${storybookConfigDir}`);

try {
  // Run webpack-dev-server with Storybook configuration
  execSync(
    `npx webpack serve --config ${storybookConfigDir}/webpack.config.js --port 6006 --open`,
    { stdio: 'inherit' }
  );
} catch (error) {
  console.error('Error starting Storybook:', error);
  process.exit(1);
}
