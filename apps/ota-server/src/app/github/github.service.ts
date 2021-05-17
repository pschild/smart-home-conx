import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { log } from '@smart-home-conx/utils';
import { from, Observable, of } from 'rxjs';
import { catchError, filter, map, mergeAll, mergeMap, tap, toArray } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import * as octonode from 'octonode';
import * as semver from 'semver';
import * as zip from 'zip-lib';
import { ReleaseType } from './release-type.enum';

@Injectable()
export class GithubService {

  private githubClient;

  constructor() {
    this.githubClient = octonode.client(process.env.GITHUB_ACCESS_TOKEN);
  }

  getRepositories(): Observable<any> {
    return from(this.githubClient.me().reposAsync({ per_page: 999 })).pipe(
      map(([repos, headers]) => repos),
      mergeAll(),
      filter((repo: any) => repo.name.indexOf('esp-') === 0), // get only repo names starting with "esp-"
      mergeMap((repo: any) => from(this.githubClient.repo(repo.full_name).contentsAsync('platformio.ini')).pipe(
        map(([contents, headers]) => repo.name), // if there is a platform.ini file, return the repo's name
        catchError(err => of(null))
      )),
      filter(repoName => !!repoName), // filter repos without platform.ini file
      toArray()
    );
  }

  getNextVersion(libName: string, releaseType: ReleaseType = 'patch'): Observable<string> {
    return this.getLatestVersion(libName).pipe(
      tap(latestVersion => log(`latest version: ${latestVersion}`)),
      map(latestVersion => latestVersion ? semver.inc(latestVersion, releaseType) : '0.0.1'),
      tap(nextVersion => log(`next version: ${nextVersion}`))
    );
  }

  createRelease(libName: string, version: string): Observable<string> {
    const repository = this.githubClient.repo(`pschild/${libName}`);
    return new Observable(observer => {
      log(`creating release for pschild/${libName}...`);
      repository.release({ name: `v${version}`, tag_name: version }, (_, release) => {
        log(`Done. releaseId=${release.id}`);
        observer.next(release.id);
        observer.complete();
      });
    });
  }

  uploadArchive(libName: string, releaseId: string): Observable<any> {
    const release = this.githubClient.release(`pschild/${libName}`, releaseId);
    return new Observable(observer => {
      log(`uploading archive for pschild/${libName} to Github...`);
      const buildDirPath = path.join(environment.espProjectsDir, libName, '.pio', 'build');
      const zipFilePath = path.join(environment.espProjectsDir, libName, 'release.zip');

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
    const repository = this.githubClient.repo(`pschild/${libName}`);
    return new Observable(observer => {
      repository.releases((err, releases) => {
        if (err) {
          return observer.error(new Error(`Error during version check: ${err.message}`));
        }

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