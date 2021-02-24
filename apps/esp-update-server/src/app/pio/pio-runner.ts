import * as fs from 'fs';
import { ChildProcess, spawn } from 'child_process';
import { SocketManager } from '../socket/socket-manager';
import { Inject } from 'typescript-ioc';
import { Observable } from 'rxjs';
import { log } from '@smart-home-conx/utils';
import { getPathToEspLib } from '../path.utils';

export class PioRunner {

  @Inject
  socketManager: SocketManager;

  private process: ChildProcess;

  constructor(private libName: string, private version: string, private targets: Set<string>) { }

  run(): Observable<string> {
    const espLibPath = getPathToEspLib(this.libName);
    const textDecoder = new TextDecoder('utf-8');

    return new Observable(observer => {
      // TODO: weiter nach oben ziehen
      if (!fs.existsSync(espLibPath)) {
        throw new Error(`Directory '${espLibPath}' does not exist`);
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
        this.socketManager.broadcast(`${this.libName}/stdout`, textDecoder.decode(data));
        observer.next(textDecoder.decode(data));
      });

      this.process.stderr.on('data', data => {
        console.error(`stderr: ${data}`);
        this.socketManager.broadcast(`${this.libName}/stderr`, textDecoder.decode(data));
        observer.next(textDecoder.decode(data));
      });

      this.process.on('close', exitCode => {
        console.log('CLOSE', exitCode);
        exitCode === 0 ? observer.complete() : observer.error(exitCode);
        this.process = null;
      });

      this.process.on('exit', exitCode => console.log('EXIT', exitCode));
      this.process.on('error', err => {
        observer.error(new Error(`Error during spawn process: ${err.message}. Does pio exits on your system and is added to PATH?`));
      });
    });
  }

  stop(): void {
    return this.process.kill();
  }

}