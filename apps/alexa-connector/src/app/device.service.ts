import { Injectable } from '@nestjs/common';
import { log } from '@smart-home-conx/utils';
const { exec } = require('child_process');
import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { from, Observable } from 'rxjs';

@Injectable()
export class DeviceService {

  loadAvailableDevices(): Observable<string> {
    return new Observable<string>(subscriber => {
      exec(`./assets/alexa-remote-control/alexa_remote_control.sh -a`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          subscriber.error(error);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          subscriber.error(stderr.toString());
        }
        log(`stdout: ${stdout}`);
        subscriber.next(stdout);
        subscriber.complete();
      });
    });
  }
  
  readDeviceList(): Observable<string> {
    return from(fsPromises.readFile(path.join('/tmp', '.alexa.devicelist.json'), 'utf8'));
  }

}
