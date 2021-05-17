import { Body, Controller, Get, Headers, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { concat, forkJoin } from 'rxjs';
import { catchError, mapTo, mergeMap, tap } from 'rxjs/operators';
import { EventsGateway } from './events.gateway';
import { GitService } from './git/git.service';
import { GithubService } from './github/github.service';
import { PioBuilderService } from './pio/pio-builder.service';
import { DeviceModel } from '@smart-home-conx/api/shared/data-access/models';
import { RunBuildDto } from './dto';
import { EspRequestHeader } from './decorator/esp-request-header.decorator';
import { isDocker, log } from '@smart-home-conx/utils';
import { BinaryProvider } from './binary/binary.provider';
import { ReleaseType } from './github/release-type.enum';

@Controller()
export class AppController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly pioBuilderService: PioBuilderService,
    private readonly gitService: GitService,
    private readonly githubService: GithubService,
    private readonly gateway: EventsGateway,
    private readonly binaryProvider: BinaryProvider,
  ) {}

  @Get('ota')
  async getBinary(
    @Res() res: Response,
    @EspRequestHeader() headers: any,
    @Headers('x-esp8266-chip-id') chipId: number,
    @Headers('x-esp8266-version') currentVersion: string
  ) {
    log(`ESP Chip ${chipId} is using version ${currentVersion}.`);
    log(`\tChecking for new version...`);

    const findBinaryResult: { path: string; fileName: string; } = await this.binaryProvider.findBinaryForUpdate(chipId, currentVersion);
    if (findBinaryResult) {
      log(`\tSending new binary ${findBinaryResult.path}...`);
      this.mqttClient.emit('telegram/message', `🔄 ESP ${chipId} geupdated: ${currentVersion} => ${findBinaryResult.fileName}`);
      return res.sendFile(findBinaryResult.path, err => {
        if (err) {
          log(`\t\tThere was an error sending the binary at ${findBinaryResult.path}:`);
          log(err.toString());
          res.status(304).end();
        }
      });
    }
    return res.status(304).end();
  }

  @Post('build/run')
  async runBuild(@Body() runBuildDto: RunBuildDto) {
    if (this.pioBuilderService.isRunning()) {
      throw new HttpException('Could not start build. Another build is already running.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { libName, releaseType, chipIds } = runBuildDto;
    const espList = await this.deviceClient.send<DeviceModel[]>('loadDeviceList', {}).toPromise();
    const targets = new Set<string>(
      espList.filter(esp => chipIds.includes(esp.chipId)).map(esp => esp.pioEnv)
    );

    if (targets.size === 0) {
      throw new HttpException(`Could not find any targets based on chipIds [${chipIds.join(',')}]`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const cloneOrUpdate$ = this.gitService.cloneOrUpdate(libName);
    const nextVersion$ = this.githubService.getNextVersion(libName, releaseType as ReleaseType);

    const pioBuild$ = nextVersion => {
      const runner = this.pioBuilderService.create(libName, nextVersion, targets);
      return this.pioBuilderService.start(runner).pipe(
        tap(output => this.gateway.broadcast(`esp-motion-sensor/${output.type}`, output.payload))
      );
    };
    const releaseAndArchive$ = nextVersion => this.githubService.createRelease(libName, nextVersion).pipe(
      mergeMap(releaseId => this.githubService.uploadArchive(libName, releaseId))
    )
    const copyBinFiles$ = nextVersion => this.pioBuilderService.copyBinFiles(libName, chipIds, espList, nextVersion);

    /**
     * START ───┬─── cloneOrUpdate$ ───┬──── pioBuild$ ───┬─── releaseAndArchive$ ───┬─── END
     *          └─── nextVersion$ ─────┘                  └─── copyBinFiles$ ────────┘
     */
    return forkJoin([cloneOrUpdate$, nextVersion$]).pipe(
      mergeMap(([cloneOrUpdate, nextVersion]) => concat(
        pioBuild$(nextVersion),
        forkJoin([releaseAndArchive$(nextVersion), copyBinFiles$(nextVersion)])
      )),
      catchError(err => {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
      mapTo({ success: true })
    );
  }

  @Get('build/kill')
  killBuild() {
    try {
      return this.pioBuilderService.stopActive();
    } catch(err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
