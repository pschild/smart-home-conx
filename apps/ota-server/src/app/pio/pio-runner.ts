import * as fs from 'fs';
import * as path from 'path';
import { ChildProcess, spawn } from 'child_process';
import { Observable } from 'rxjs';
import { log } from '@smart-home-conx/utils';
import { environment } from '../../environments/environment';
import { HttpException, HttpStatus } from '@nestjs/common';

export class PioRunner {

  private process: ChildProcess;

  constructor(private libName: string, private version: string, private targets: Set<string>) {
  }

  run(): Observable<{ type: string; payload: string; }> {
    const espLibPath = path.join(environment.espProjectsDir, this.libName);
    const textDecoder = new TextDecoder('utf-8');

    return new Observable(observer => {
      if (!fs.existsSync(espLibPath)) {
        throw new HttpException(`Directory '${espLibPath}' does not exist`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const spawnArgs = this.targets.size ? [].concat.apply([], ['run', ...Array.from(this.targets).map(target => ['-e', target])]) : ['run'];
      log(`Calling spawn: pio ${spawnArgs.join(' ')}`);
      this.process = spawn('pio', spawnArgs, {
        cwd: espLibPath,
        env: {
          ...process.env,
          WIFI_SSID: process.env.WIFI_SSID,
          WIFI_PASS: process.env.WIFI_PASS,
          FIRMWARE_VERSION: `${this.libName}_v${this.version}`
        }
      });

      this.process.stdout.on('data', data => {
        console.log(`stdout: ${data}`);
        observer.next({ type: 'stdout', payload: textDecoder.decode(data) });
      });

      this.process.stderr.on('data', data => {
        console.error(`stderr: ${data}`);
        observer.next({ type: 'stderr', payload: textDecoder.decode(data) });
      });

      this.process.on('close', exitCode => {
        console.log('CLOSE', exitCode);
        exitCode === 0 ? observer.complete() : observer.error(`Process closed unexpectedly (exit code ${exitCode})`);
        this.process = null;
      });

      this.process.on('exit', exitCode => console.log('EXIT', exitCode));
      this.process.on('error', err => {
        observer.error(new Error(`Error during spawn process: ${err.message}. Does pio exists on your system and is added to PATH?`));
      });
    });
  }

  stop(): void {
    return this.process.kill();
  }

}