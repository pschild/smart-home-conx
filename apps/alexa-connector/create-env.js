const { writeFileSync, readFileSync } = require('fs');
const { resolve } = require('path');

const envSourcePath = resolve(__dirname, '..', '..', '.env');
let envContent;
try {
  envContent = readFileSync(envSourcePath, 'utf-8').toString();
} catch (error) {
  console.error('Error reading .env file from root dir.', error);
  process.exit(0);
}

const EMAIL = envContent.match(/AMAZON_EMAIL=(.+)/)[1];
const PASSWORD = envContent.match(/AMAZON_PASSWORD=(.+)/)[1];
const MFA_SECRET = envContent.match(/AMAZON_MFA_SECRET=(.+)/)[1];

const envTargetPath = resolve(__dirname, 'src', 'assets', 'alexa-remote-control', 'env', 'variables.env');
try {
  writeFileSync(
    envTargetPath,
`AMAZON_EMAIL=${EMAIL}
AMAZON_PASSWORD=${PASSWORD}
AMAZON_MFA_SECRET=${MFA_SECRET}`,
    { encoding: 'utf-8' }
  );
} catch (error) {
  console.error('Error writing variables.env file.', error);
  process.exit(0);
}
