import * as path from 'path';
import * as fsx from 'fs-extra';
import { Injectable } from '@nestjs/common';
import { finalize } from 'rxjs/operators';
import { PioRunner } from './pio-runner';
import { forkJoin, Observable, throwError } from 'rxjs';
import { log } from '@smart-home-conx/utils';
import { environment } from '../../environments/environment';

@Injectable()
export class PioBuilderService {

  private activeRunner: PioRunner;

  create(libName: string, version: string, targets: Set<string>): PioRunner {
    return new PioRunner(libName, version, targets);
  }

  start(runner: PioRunner): Observable<{ type: string; payload: string; }> {
    if (this.isRunning()) {
      return throwError(new Error(`There is already a runner running.`));
    }

    this.activeRunner = runner;
    return this.activeRunner.run().pipe(
      finalize(() => this.activeRunner = null)
    );
  }

  stopActive(): boolean {
    if (this.activeRunner) {
      return this.activeRunner.stop();
    }
  }

  copyBinFiles(libName: string, chipIds: number[], espList: any[], version: string): Observable<string[]> {
    const copyTasks$: Observable<string>[] = [];
    for (const chipId of chipIds) {
      const pioEnv = this.getPioEnvByChipId(espList, chipId);
      const sourceFilePath = path.join(environment.espProjectsDir, libName, '.pio', 'build', pioEnv, 'firmware.bin');
      const targetDirPath = path.resolve(environment.espBinaryDir, chipId.toString());
      const targetFilePath = path.join(targetDirPath, `${libName}_v${version}.bin`);

      // Deletes directory contents if the directory is not empty. If the directory does not exist, it is created.
      fsx.emptyDirSync(targetDirPath);

      const copyTask$ = new Observable<string>(observer => {
        fsx.copy(sourceFilePath, targetFilePath, err => {
          if (err) {
            return observer.error(err);
          } else {
            log(`copied ${sourceFilePath} to ${targetFilePath}`);
            observer.next(targetFilePath);
            observer.complete();
          }
        });
      });

      copyTasks$.push(copyTask$);
    }
    return forkJoin(copyTasks$);
  }

  isRunning(): boolean {
    return !!this.activeRunner;
  }

  private getPioEnvByChipId(espList: any[], chipId: number): string {
    return espList.find(esp => esp.chipId === chipId)?.pioEnv;
  }

}
