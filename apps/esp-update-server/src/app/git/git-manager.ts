import * as fs from 'fs';
import { from, Observable, throwError } from 'rxjs';
import { Singleton } from 'typescript-ioc';
import simpleGit, { SimpleGit } from 'simple-git';
import { PullResult } from 'simple-git/typings/response';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isDocker, log } from '@smart-home-conx/utils';

@Singleton
export class GitManager {

  private gitClient: SimpleGit;

  constructor() {
    this.gitClient = simpleGit();
  }

  cloneOrUpdate(libName: string): Observable<string | PullResult> {
    const repoDir = this.buildPath(libName);
    if (!fs.existsSync(repoDir)) {
      return from(
        this.gitClient.clone(`https://github.com/pschild/${libName}`, repoDir)
      ).pipe(
        tap(() => log(`Cloning repo...`)),
        catchError(err => throwError(new Error(`Error during clone: ${err.message}`)))
      );
    } else {
      return from(
        this.gitClient.cwd(repoDir)
          .then(() => this.gitClient.pull())
      ).pipe(
        tap(() => log(`Repo exists. Pulling...`)),
        catchError(err => throwError(new Error(`Error during cwd/pull: ${err.message}`)))
      );
    }
  }

  private buildPath(libName: string): string {
    const prefix = isDocker() ? '' : '.';
    return `${prefix}/${environment.espProjectsDir}/${libName}`;
  }

}
