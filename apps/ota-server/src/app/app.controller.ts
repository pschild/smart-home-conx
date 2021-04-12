import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { concat, forkJoin } from 'rxjs';
import { catchError, mapTo, mergeMap, tap } from 'rxjs/operators';
import { EventsGateway } from './events.gateway';
import { GitService } from './git/git.service';
import { GithubService } from './github/github.service';
import { PioBuilderService } from './pio/pio-builder.service';
import { DeviceModel } from '@smart-home-conx/api/shared/data-access/models';
import { RunBuildDto } from './dto';

@Controller()
export class AppController {

  @Client({ transport: Transport.TCP, options: { host: 'device-manager' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly pioBuilderService: PioBuilderService,
    private readonly gitService: GitService,
    private readonly githubService: GithubService,
    private readonly gateway: EventsGateway,
  ) {}

  @Post('build/run')
  async runBuild(@Body() runBuildDto: RunBuildDto) {
    if (this.pioBuilderService.isRunning()) {
      throw new HttpException('Could not start build. Another build is already running.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // const { libName, releaseType, chipIds } = runBuildDto;
    const libName = 'esp-motion-sensor';
    const releaseType = 'patch';
    const chipIds = [3356430];

    const espList = await this.deviceClient.send<DeviceModel[]>('loadDeviceList', {}).toPromise();
    const targets = new Set<string>(
      espList.filter(esp => chipIds.includes(esp.chipId)).map(esp => esp.pioEnv)
    );

    if (targets.size === 0) {
      throw new HttpException(`Could not find any targets based on chipIds [${chipIds.join(',')}]`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const cloneOrUpdate$ = this.gitService.cloneOrUpdate(libName);
    const nextVersion$ = this.githubService.getNextVersion(libName, releaseType);

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
