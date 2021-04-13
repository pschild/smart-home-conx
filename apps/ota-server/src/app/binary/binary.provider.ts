import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { log } from '@smart-home-conx/utils';
import { environment } from '../../environments/environment';

@Injectable()
export class BinaryProvider {

  async findBinaryForUpdate(chipId: number, currentVersion?: string): Promise<{ path: string; fileName: string; } | undefined> {
    const chipFolderPath = path.resolve(environment.espBinaryDir, chipId.toString());
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
      if (!!currentVersion && this.isSameVersion(onlyBinFileName, currentVersion)) {
        log(`\tNo other version available. Current: ${currentVersion}, found: ${onlyBinFileName}`);
        return;
      }

      return {
        path: path.resolve(chipFolderPath, onlyBinFileName),
        fileName: onlyBinFileName.substring(0, onlyBinFileName.lastIndexOf('.'))
      };
    } catch (err) {
      log(`\tError reading directory ${chipFolderPath}: ${err}`);
    }
  }

  private isSameVersion(versionStr1: string, versionStr2: string): boolean {
    const VERSION_PATTERN = /v?(\d+\.\d+\.\d+)/;

    const versionNo1 = versionStr1.match(VERSION_PATTERN);
    const versionNo2 = versionStr2.match(VERSION_PATTERN);

    return versionNo1 && versionNo1.length
      && versionNo2 && versionNo2.length
      && versionNo1[0] === versionNo2[0];
  }

}
