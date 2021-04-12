import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { from, Observable, throwError } from 'rxjs';
import simpleGit, { SimpleGit } from 'simple-git';
import { PullResult } from 'simple-git/typings/response';
import { log } from '@smart-home-conx/utils';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class GitService {

  private gitClient: SimpleGit;

  constructor() {
    this.gitClient = simpleGit();
  }

  cloneOrUpdate(libName: string): Observable<string | PullResult> {
    const repoDir = path.join(environment.espProjectsDir, libName);
    if (!fs.existsSync(repoDir)) {
      return from(
        this.gitClient.clone(`https://github.com/pschild/${libName}`, repoDir)
      ).pipe(
        tap(() => log(`Cloning repo pschild/${libName}...`)),
        catchError(err => throwError(new Error(`Error during clone: ${err.message}`)))
      );
    } else {
      return from(
        this.gitClient.cwd(repoDir)
          .then(() => this.gitClient.pull())
      ).pipe(
        tap(() => log(`Repo pschild/${libName} exists. Pulling...`)),
        catchError(err => throwError(new Error(`Error during cwd/pull: ${err.message}`)))
      );
    }
  }

}