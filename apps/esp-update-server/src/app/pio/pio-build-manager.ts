import * as path from 'path';
import * as fsx from 'fs-extra';
import { EspConfig, ESP_CONFIG, log } from '@smart-home-conx/utils';
import { forkJoin, Observable, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Singleton } from 'typescript-ioc';
import { PioRunner } from './pio-runner';
import { getEspBinaryPath, getPathToEspLib } from '../path.utils';

@Singleton
export class PioBuildManager {

  private activeRunner: PioRunner;

  constructor() { }

  create(libName: string, version: string, chipIds: number[]): PioRunner {
    return new PioRunner(libName, version, this.getTargetsByChipIds(chipIds));
  }

  start(runner: PioRunner): Observable<string> {
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

  copyBinFiles(libName: string, chipIds: number[], version: string): Observable<string[]> {
    const copyTasks$: Observable<string>[] = [];
    for (const chipId of chipIds) {
      const pioEnv = this.getConfigByChipId(chipId).pioEnv;
      const sourceFilePath = path.join(getPathToEspLib(libName), '.pio', 'build', pioEnv, 'firmware.bin');
      const targetDirPath = path.resolve(getEspBinaryPath(), chipId.toString());
      const targetFilePath = path.join(targetDirPath, `${libName}-v${version}.bin`);

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

  private getTargetsByChipIds(chipIds: number[]): Set<string> {
    return new Set(chipIds.map(chipId => this.getConfigByChipId(chipId).pioEnv));
  }

  private getConfigByChipId(chipId: number): EspConfig {
    return ESP_CONFIG.find(esp => esp.chipId === chipId);
  }

}
