import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { log } from '@smart-home-conx/utils';
import { getEspBinaryPath } from './path.utils';

export const findBinaryForUpdate = async (chipId: string, currentVersion?: string): Promise<string | undefined> => {
  const chipFolderPath = path.resolve(getEspBinaryPath(), chipId);
  try {
    const binFilesInDirectory = (await fsPromises.readdir(chipFolderPath)).filter(fileName => fileName.match(/\.bin$/));
    if (!binFilesInDirectory || !binFilesInDirectory.length) {
      log(`\tNo bin files found in ${chipFolderPath}`);
      return;
    }

    if (binFilesInDirectory.length > 1) {
      log(`\tMore than 1 *.bin file found in ${chipFolderPath}: ${binFilesInDirectory}`);
      return;
    }

    const onlyBinFileName = binFilesInDirectory[0];
    if (isSameVersion(onlyBinFileName, currentVersion)) {
      log(`\tNo other version available. Current: ${currentVersion}, found: ${onlyBinFileName}`);
      return;
    }

    return path.resolve(chipFolderPath, onlyBinFileName);
  } catch (err) {
    log(`\tError reading directory ${chipFolderPath}: ${err}`);
  }
};

function isSameVersion(versionStr1: string, versionStr2: string): boolean {
  const VERSION_PATTERN = /v?(\d+\.\d+\.\d+)/;

  const versionNo1 = versionStr1.match(VERSION_PATTERN);
  const versionNo2 = versionStr2.match(VERSION_PATTERN);

  return versionNo1 && versionNo1.length
    && versionNo2 && versionNo2.length
    && versionNo1[0] === versionNo2[0];
}

export const originateFromEsp = headers => {
  return headers['user-agent']
  && headers['user-agent'] === 'ESP8266-http-Update'
  && headers['x-esp8266-chip-id'] // ex. 226047
  && headers['x-esp8266-sta-mac'] // ex. 4C:11:AE:03:72:FF
  && headers['x-esp8266-free-space'] // ex. 462848
  && headers['x-esp8266-sketch-size'] // ex. 301408
  && headers['x-esp8266-sketch-md5'] // ex. 18f8dc4ccb5bbb8b909a7ed1a8b5f173
  && headers['x-esp8266-chip-size'] // ex. 1048576
  && headers['x-esp8266-sdk-version'] // ex. 2.2.2-dev(38a443e)
  // && headers['x-esp8266-version'] // ex. esp-mqtt_v0.2.3
  ;
};
