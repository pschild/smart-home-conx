import * as path from 'path';
import * as fs from 'fs';
import { EspConfig, ESP_CONFIG, isDocker, log } from '@smart-home-conx/utils';
import { Observable, of, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Singleton } from 'typescript-ioc';
import { environment } from '../../environments/environment';
import { PioRunner } from './pio-runner';

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

  copyBinFiles(libName: string, chipIds: number[]): Observable<any> {
    log(`copy binaries...`);
    for (const chipId of chipIds) {
      const pioEnv = this.getConfigByChipId(chipId).pioEnv;
      const sourceFilePath = path.join(this.buildPath(libName), '.pio', 'build', pioEnv, 'firmware.bin');
      const targetDirPath = path.resolve(__dirname, 'binfiles', chipId.toString());
      const targetFilePath = path.join(targetDirPath, 'firmware.bin');

      // ensure that the target driectory exists
      fs.mkdirSync(targetDirPath, { recursive: true });

      fs.copyFileSync(sourceFilePath, targetFilePath);
      log(`copied ${sourceFilePath} to ${targetFilePath}`);
    }
    return of(true);
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

  private buildPath(libName: string): string {
    const prefix = isDocker() ? '' : '.';
    return `${prefix}/${environment.espProjectsDir}/${libName}`;
  }

}
