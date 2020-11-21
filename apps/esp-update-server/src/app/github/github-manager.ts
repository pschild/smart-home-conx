import * as path from 'path';
import * as fs from 'fs';
import { Observable } from 'rxjs';
import { Singleton } from 'typescript-ioc';
import * as octonode from 'octonode';
import * as semver from 'semver';
import { map, tap } from 'rxjs/operators';
import { isDocker, log } from '@smart-home-conx/utils';
import * as zip from 'zip-lib';
import { environment } from '../../environments/environment';

@Singleton
export class GithubManager {

  private client;

  constructor() {
    this.client = octonode.client(process.env.GITHUB_ACCESS_TOKEN);
  }

  getNextVersion(libName: string, releaseType: 'major' | 'minor' | 'patch' = 'patch'): Observable<string> {
    return this.getLatestVersion(libName).pipe(
      tap(latestVersion => log(`latest version: ${latestVersion}`)),
      map(latestVersion => latestVersion ? semver.inc(latestVersion, releaseType) : '0.0.1'),
      tap(nextVersion => log(`next version: ${nextVersion}`))
    );
  }

  createRelease(libName: string, version: string): Observable<string> {
    log(`creating release for Github...`);
    const repository = this.client.repo(`pschild/${libName}`);
    return new Observable(observer => {
      repository.release({ name: `v${version}`, tag_name: version }, (_, release) => {
        observer.next(release.id);
        observer.complete();
      });
    });
  }

  uploadArchive(libName: string, releaseId: string): Observable<any> {
    log(`uploading archive to Github...`);
    const release = this.client.release(`pschild/${libName}`, releaseId);
    return new Observable(observer => {
      const buildDirPath = path.join(isDocker() ? '' : '.', environment.espProjectsDir, libName, '.pio', 'build');
      const zipFilePath = path.join(isDocker() ? '' : '.', environment.espProjectsDir, libName, 'release.zip');

      if (!fs.existsSync(buildDirPath)) {
        throw new Error(`Could not find directory '${buildDirPath}' for upload`);
      }

      zip.archiveFolder(buildDirPath, zipFilePath)
        .then(() => fs.readFileSync(zipFilePath))
        .then(zipFile => release.uploadAssets(zipFile, { name: 'release.zip' }, (_, result) => {
          observer.next(result);
          observer.complete();
        }));
    });
  }

  private getLatestVersion(libName: string): Observable<string> {
    const repository = this.client.repo(`pschild/${libName}`);
    return new Observable(observer => {
      repository.releases((_, releases) => {
        const liveReleases = releases
          .filter(release => !release.draft && !release.prerelease)
          .map(release => ({ id: release.id, tag_name: release.tag_name }));

        if (liveReleases.length > 0) {
          const maxTag = liveReleases.reduce((prev, curr) => semver.gt(prev.tag_name, curr.tag_name) ? prev : curr);
          observer.next(maxTag.tag_name);
        } else {
          observer.next(undefined);
        }
        observer.complete();
      });
    });
  }

}
