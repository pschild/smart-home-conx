import { Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { join, extname } from 'path';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ScreenshotService {

  public static SCREENSHOTS_FOLDER_PATH = join(__dirname, 'assets', 'screenshots');
  public static SCREENSHOT_FORMAT = '.png';

  constructor() {}

  getAll(): Observable<string[]> {
    return from(fsPromises.readdir(ScreenshotService.SCREENSHOTS_FOLDER_PATH, 'utf8')).pipe(
      map(files => files.filter(file => extname(file).toLowerCase() === ScreenshotService.SCREENSHOT_FORMAT))
    );
  }

}
