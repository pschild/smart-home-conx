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

const SERVICE_USER = envContent.match(/SERVICE_USER=(.+)/)[1];
const SERVICE_PASSWORD = envContent.match(/SERVICE_PASSWORD=(.+)/)[1];
const envTargetContent = { SERVICE_USER, SERVICE_PASSWORD };

const envTargetPath = resolve(__dirname, 'src', 'environments', 'env.json');
try {
  writeFileSync(envTargetPath, JSON.stringify(envTargetContent, null, 2), { encoding: 'utf-8' });
} catch (error) {
  console.error('Error writing env.json file.', error);
  process.exit(0);
}
