import { Controller, Get } from '@nestjs/common';
import { ScreenshotService } from './screenshots.service';

@Controller()
export class ScreenshotController {

  constructor(
    private readonly screenshotService: ScreenshotService
  ) {}

  @Get('screenshots')
  getAll() {
    return this.screenshotService.getAll();
  }

}
