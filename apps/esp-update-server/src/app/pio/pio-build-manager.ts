import { Observable, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Singleton } from 'typescript-ioc';
import { PioRunner } from './pio-runner';

@Singleton
export class PioBuildManager {

  private activeRunner: PioRunner;

  constructor() { }

  create(libName: string): PioRunner {
    return new PioRunner(libName);
  }

  start(runner: PioRunner): Observable<string> {
    if (this.activeRunner) {
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

}
