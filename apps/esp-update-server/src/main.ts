import * as express from 'express';
import { json } from 'body-parser';
import { Application, Request, Response } from 'express';
import * as http from 'http';
import { Inject } from 'typescript-ioc';
import { originateFromEsp, findBinaryForUpdate } from './app/binary.provider';
import { log, isAuthorized } from '@smart-home-conx/utils';
import * as dotenv from 'dotenv';
import { environment } from './environments/environment';
import { PioBuildManager } from './app/pio/pio-build-manager';
import { SocketManager } from './app/socket/socket-manager';
import { GithubManager } from './app/github/github-manager';
import { GitManager } from './app/git/git-manager';
import { mergeMap } from 'rxjs/operators';
import { forkJoin, concat } from 'rxjs';
import { getEspBinaryPath } from './app/path.utils';

dotenv.config();

class EspUpdateServerApplication {

  private server: http.Server;
  private port = 9042;

  @Inject
  pioBuildManager: PioBuildManager;

  @Inject
  socketManager: SocketManager;

  @Inject
  gitManager: GitManager;

  @Inject
  githubManager: GithubManager;

  constructor() {
    const app: Application = express();

    // app.use((req, res, next) => {
    //   if (!isAuthorized(req)) {
    //     return res.status(401).send(`Not authorized`);
    //   }
    //   return next();
    // });

    app.use(express.static(getEspBinaryPath()));
    app.use(json());

    app.get('/ota', async (req: Request, res: Response) => {
      const headers = req.headers;
      if (!originateFromEsp(headers)) {
        log(`URL accessed by an unknown source: ${JSON.stringify(headers)}`);
        return res.status(500).send(`Request not coming from an ESP. Aborting!`);
      }

      const chipId = headers['x-esp8266-chip-id'] as string;
      const currentVersion = headers['x-esp8266-version'] as string;
      log(`ESP Chip ${chipId} is using version ${currentVersion}.`);
      log(`\tChecking for new version...`);

      const pathToBinary: string = await findBinaryForUpdate(chipId, currentVersion);
      if (pathToBinary) {
        log(`\tSending new binary at ${pathToBinary}...`);
        res.sendFile(pathToBinary, err => {
          if (err) {
            log(`\t\tThere was an error sending the binary in path ${pathToBinary}:`);
            log(err.toString());
            res.status(304).end();
          }
        });
      } else {
        res.status(304).end();
      }
    });

    app.post('/build/run', async (req, res) => {
      if (this.pioBuildManager.isRunning()) {
        return res.status(500).json({ error: 'Could not start build. Another build is already running.' });
      }

      const { libName, releaseType, chipIds } = req.body;

      const cloneOrUpdate$ = this.gitManager.cloneOrUpdate(libName);
      const nextVersion$ = this.githubManager.getNextVersion(libName, releaseType);
      const pioBuild$ = nextVersion => this.pioBuildManager.start(this.pioBuildManager.create(libName, nextVersion, chipIds));
      const releaseAndArchive$ = nextVersion => this.githubManager.createRelease(libName, nextVersion).pipe(
        mergeMap(releaseId => this.githubManager.uploadArchive(libName, releaseId))
      )
      const copyBinFiles$ = nextVersion => this.pioBuildManager.copyBinFiles(libName, chipIds, nextVersion);

      /**
       * START ───┬─── cloneOrUpdate$ ───┬──── pioBuild$ ───┬─── releaseAndArchive$ ───┬─── END
       *          └─── nextVersion$ ─────┘                  └─── copyBinFiles$ ────────┘
       */
      forkJoin([cloneOrUpdate$, nextVersion$]).pipe(
        mergeMap(([cloneOrUpdate, nextVersion]) => concat(
          pioBuild$(nextVersion),
          forkJoin([releaseAndArchive$(nextVersion), copyBinFiles$(nextVersion)])
        ))
      ).subscribe({
        error(err) { res.status(500).json({ error: err && err.message ? err.message : `Running build failed due to an unknown error.` }); },
        complete() { res.status(200).json({ success: true }); }
      });
    });

    app.get('/build/kill', (req, res) => {
      try {
        res.status(200).json({ success: this.pioBuildManager.stopActive() });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.server = http.createServer(app);
  }

  start(): void {
    this.socketManager.init(this.server);

    this.server.listen(this.port, () => {
      log(`running at http://localhost:${this.port}`);
      log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    });
  }

}

const application = new EspUpdateServerApplication();
application.start();
