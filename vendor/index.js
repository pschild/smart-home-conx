const fs = require('fs');
const resolve = require('path').resolve;
const join = require('path').join;
const { exec } = require('child_process');

const APPS_DIR = '../dist/apps/';
const MAIN_FILENAME = 'main.js';
const OUTPUT_DIR = 'vendorApp';

function execShellCommand(cmd) {
  return new Promise((r, _) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      r(stdout ? stdout : stderr);
    });
  });
}

async function nccDirs(appsDist) {
  for (const dir of fs.readdirSync(appsDist)) {
    const appDir = join(appsDist, dir);
    const appMain = join(appDir, MAIN_FILENAME);

    if (fs.existsSync(appMain)) {
      console.log('ncc for:', appMain);
      const result = await execShellCommand(`ncc build ${appMain} -m -C -o ${join(appDir, OUTPUT_DIR)}`);
      console.log(result);
    }
  }
}

// get library path
nccDirs(resolve(__dirname, APPS_DIR));