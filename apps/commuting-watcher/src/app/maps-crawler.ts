import * as puppeteer from 'puppeteer';
import { LatLng } from './travel-time.service';
import * as path from 'path';
import * as isPi from 'detect-rpi';
import { isDocker, log } from '@smart-home-conx/utils';
import { format } from 'date-fns';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PreferenceService } from '@smart-home-conx/preference';
import { ScreenshotService } from './screenshots.service';

export enum TrafficDelay {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  DEFAULT = 'default'
}

export interface CrawlResultItem {
  minutes: number;
  delay: TrafficDelay;
}

@Injectable()
export class GoogleMapsCrawler {

  constructor(private readonly preferenceService: PreferenceService) {}

  async crawl(origin: LatLng, destination: LatLng): Promise<CrawlResultItem[]> {
    let launchOptions: any = {
      headless: true,
      defaultViewport: { width: 1024, height: 768 }
    };

    if (isPi() || isDocker()) {
      launchOptions = {
        ...launchOptions,
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox']
      };
    }

    let browser;
    try {
      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      // pass logs within headless browser to main console
      page.on('console', consoleObj => {
        if (consoleObj.type() === 'log') {
          log(consoleObj.text());
        }
      });

      log('Go to page ...');
      // Example: https://www.google.de/maps/dir/51.5045685,6.9971393/51.668189,6.148282/data=!3m1!4b1!4m2!4m1!3e0
      await page.goto(
        `https://www.google.de/maps/dir/${origin.latitude},${origin.longitude}/${destination.latitude},${destination.longitude}/data=!3m1!4b1!4m2!4m1!3e0`
      );
      log('Check if we need to accept cookies ...');
      const acceptButton = await page.$x('.//button/span[contains(text(), "Ich stimme zu")]');
      if (!!acceptButton && acceptButton.length) {
        log('Accept cookies ...');
        acceptButton[0].click();
      }

      log('Wait for trips visible ...');
      // take the first trip as indicator for the page finished loading
      await page.waitFor(`#section-directions-trip-0`);

      if (await this.preferenceService.getValueFor('saveScreenshotsEnabled')) {
        log('Saving screenshot ...');
        await page.screenshot({
          path: path.join(ScreenshotService.SCREENSHOTS_FOLDER_PATH, `maps-${format(new Date(), 'yyyy-MM-dd_HH-mm-ss-SSS')}${ScreenshotService.SCREENSHOT_FORMAT}`),
          // clip: { x: 435, y: 50, width: 1024 - 435, height: 768 - 50 * 2 }
          // clip: { x: 435, y: 0, width: 1024 - 435, height: 768 }
        });
      }

      log('Evaluating page ...');
      const durationsForCar: { content: string; className: string }[] = await page.evaluate(() => {
        const DURATION_ROW_SELECTOR = `section-directions-trip-`;
        const DURATION_SELECTOR = `trip-duration`;

        // loop over all trips and collect raw duration string for each
        return Array.from(document.querySelectorAll(`[id^="${DURATION_ROW_SELECTOR}"]`))
          .filter(e => e.id.match(new RegExp(`${DURATION_ROW_SELECTOR}\\d$`)))
          .map(row => Array.from(row.querySelectorAll('div'))
            .filter(e => e.className.match(DURATION_SELECTOR))
            .map(e => ({ content: e.textContent, className: e.className }))
          )
          .reduce((acc, val) => acc.concat(val), []);
      });
      durationsForCar.map(item => log(`duration=${item.content}, delay=${this.parseDelayClass(item.className)}`));
      log(`parsed durations: ${durationsForCar.map(item => this.parseDuration(item.content))}`);
      return durationsForCar.map(item => ({ minutes: this.parseDuration(item.content), delay: this.parseDelayClass(item.className) }));

    } catch(error) {
      throw new HttpException(`Puppeteer parsing failed: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);

    } finally {
      log('Closing browser ...');
      await browser.close();
    }
  }

  private parseDelayClass(className: string): TrafficDelay {
    if (className.includes('delay-light')) {
      return TrafficDelay.LIGHT;
    } else if (className.includes('delay-medium')) {
      return TrafficDelay.MEDIUM;
    } else if (className.includes('delay-heavy')) {
      return TrafficDelay.HEAVY;
    } else {
      return TrafficDelay.DEFAULT;
    }
  }

  private parseDuration(rawDuration: string): number {
    // Attention! "(?= (Std.|h))" does not work as lookahead pattern, as we cannot be sure if a normal space or a "different kind" of space (?) is in front of "Std." or "h".
    // So we need to match for a single character with . instead... => "(?=.(Std.|h))". Same applies for parsing the minutes.
    const hours = rawDuration.match(/\d+(?=.(Std.|h))/g);
    const mins = rawDuration.match(/\d+(?=.(Min.|min))/g);

    let duration = 0;
    if (hours) {
      duration += +hours[0] * 60;
    }
    if (mins) {
      duration += +mins[0];
    }
    return duration;
  }

}
