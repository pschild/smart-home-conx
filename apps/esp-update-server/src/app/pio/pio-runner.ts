import * as fs from 'fs';
import { ChildProcess, spawn } from 'child_process';
import { SocketManager } from '../socket/socket-manager';
import { Inject } from 'typescript-ioc';
import { Observable } from 'rxjs';

const ESP_PROJECTS_DIR = '/esp-projects';

export class PioRunner {

  @Inject
  socketManager: SocketManager;

  private process: ChildProcess;

  constructor(private libName: string) { }

  run(): Observable<string> {
    const espLibPath = this.buildPath();
    const textDecoder = new TextDecoder('utf-8');

    return new Observable(observer => {
      if (!fs.existsSync(espLibPath)) {
        throw new Error(`Directory '${espLibPath}' does not exist`);
      }

      this.process = spawn('pio', ['run'], { cwd: espLibPath });

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
      this.process.on('error', err => console.log('ERROR', err.name, err.message, JSON.stringify(err)));
    });
  }

  stop(): boolean {
    return this.process.kill();
  }

  private buildPath(): string {
    return `${ESP_PROJECTS_DIR}/${this.libName}`;
  }

}