import { Injectable } from '@nestjs/common';
import { log } from '@smart-home-conx/utils';
const { exec } = require('child_process');
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CommandService {
  
  execute(device: string, command: { action: 'speak' | 'automation' | 'textcommand', param: string }): Observable<string> {
    return new Observable<string>(subscriber => {
      let commandStr = `./assets/alexa-remote-control/alexa_remote_control.sh -d '${device}'`;
      switch (command.action) {
        case 'speak':
          commandStr += ` -e speak:'${command.param}'`;
          break;
        case 'automation':
          commandStr += ` -e automation:'${command.param}'`;
          break;
        case 'textcommand':
          commandStr += ` -e textcommand:'${command.param}'`;
          break;
      }
  
      log(`executing command: ${commandStr}`);
      exec(commandStr, (error, stdout, stderr) => {
        if (error) {
          subscriber.error(error);
        }
        if (stderr) {
          subscriber.error(stderr.toString());
        }
        subscriber.next(stdout);
        subscriber.complete();
      });
    }).pipe(
      catchError(error => {
        console.error('exec errored with error: ', error);
        return EMPTY;
      })
    );
  }

}
