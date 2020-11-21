import * as fs from 'fs';
import { from, Observable, throwError } from 'rxjs';
import { Singleton } from 'typescript-ioc';
import simpleGit, { SimpleGit } from 'simple-git';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isDocker, log } from '@smart-home-conx/utils';

@Singleton
export class GitManager {

  private gitClient: SimpleGit;

  constructor() {
    this.gitClient = simpleGit();
  }

  cloneOrUpdate(libName: string): Observable<unknown> {
    const repoDir = this.buildPath(libName);
    if (!fs.existsSync(repoDir)) {
      log(`Cloning repo...`);
      return from(
        this.gitClient.clone(`https://github.com/pschild/${libName}`, repoDir)
      ).pipe(
        catchError(err => throwError(new Error(`Error during clone: ${err.message}`)))
      );
    } else {
      log(`Repo exists. Pulling...`);
      return from(
        this.gitClient.cwd(repoDir)
          .then(() => this.gitClient.pull())
      ).pipe(
        catchError(err => throwError(new Error(`Error during cwd/pull: ${err.message}`)))
      );
    }
  }

  private buildPath(libName: string): string {
    const prefix = isDocker() ? '' : '.';
    return `${prefix}/${environment.espProjectsDir}/${libName}`;
  }

}
