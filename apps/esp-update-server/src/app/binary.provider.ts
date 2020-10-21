import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { log } from '@smart-home-poc/utils';

export const findBinaryForUpdate = async (chipId: string, currentVersion?: string): Promise<string | undefined> => {
  const chipFolderPath = path.resolve(__dirname, '..', 'binfiles', chipId);
  try {
    const allBinaries = (await fsPromises.readdir(chipFolderPath)).filter(fileName => fileName.match(/\.bin$/));
    const fileNameOfLatestVersion = getFileNameOfLatestVersion(allBinaries, currentVersion);
    if (fileNameOfLatestVersion) {
      return path.resolve(chipFolderPath, fileNameOfLatestVersion);
    } else {
      log(`\tNo firmware file found or chip is already using the latest version.`);
      return;
    }
  } catch (err) {
    log(`\tError reading directory ${chipFolderPath}: ${err}`);
  }
};

export const getFileNameOfLatestVersion = (files: string[], currentVersion?: string): string | undefined => {
  if (!files || files.length === 0) {
    return undefined;
  }

  // sort by version
  files.sort((a, b) => {
    const versionAMatches = a.match(/-v(\d+)-/);
    const versionBMatches = b.match(/-v(\d+)-/);
    if (!versionAMatches || !versionBMatches) {
      throw new Error(`Cannot not parse version during sorting.`);
    }
    const versionA = +versionAMatches[1];
    const versionB = +versionBMatches[1];
    return versionA - versionB;
  });

  const fileNameWithLatestVersion: string = files[files.length - 1];
  const latestVersionMatches = fileNameWithLatestVersion.match(/-(v\d+-[a-z0-9]{7})/); // e.g. v1-foobar1, v42-baz2bar, ...
  if (!latestVersionMatches || latestVersionMatches.length < 2) {
    throw new Error(`Cannot parse version from name "${fileNameWithLatestVersion}"`);
  }
  const latestVersion: string = latestVersionMatches[1];
  log(`\tlatest version found: ${latestVersion}`);

  if (!currentVersion || currentVersion !== latestVersion) {
    return fileNameWithLatestVersion;
  }
};
