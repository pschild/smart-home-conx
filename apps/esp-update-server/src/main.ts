import * as express from 'express';
import { json } from 'body-parser';
import { Application, Request, Response } from 'express';
import * as http from 'http';
import { Inject } from 'typescript-ioc';
import * as path from 'path';
import { findBinaryForUpdate } from './app/binary.provider';
import { log, isAuthorized } from '@smart-home-conx/utils';
import * as dotenv from 'dotenv';
import { environment } from './environments/environment';
import { PioBuildManager } from './app/pio/pio-build-manager';
import { SocketManager } from './app/socket/socket-manager';
import { GithubManager } from './app/github/github-manager';
import { GitManager } from './app/git/git-manager';
import { switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

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

    app.use(express.static(path.join(__dirname, 'binfiles')));
    app.use(json());

    app.get('/', (req, res) => {
      // log(JSON.stringify(req.headers));
      res.status(200).json({ status: 'ready' });
    });

    app.get('/ota', async (req: Request, res: Response) => {
      // log(JSON.stringify(req.headers));

      /*
      req.headers = {
          "user-agent":"ESP8266-http-Update",
          "x-esp8266-chip-id":"226047",
          "x-esp8266-sta-mac":"4C:11:AE:03:72:FF",
          "x-esp8266-ap-mac":"4E:11:AE:03:72:FF",
          "x-esp8266-free-space":"462848",
          "x-esp8266-sketch-size":"301408",
          "x-esp8266-sketch-md5":"18f8dc4ccb5bbb8b909a7ed1a8b5f173",
          "x-esp8266-chip-size":"1048576",
          "x-esp8266-sdk-version":"2.2.2-dev(38a443e)",
      }
      */

      const headers = req.headers;
      if (
        !headers['user-agent'] || headers['user-agent'] !== 'ESP8266-http-Update'
        || !headers['x-esp8266-chip-id']
        || !headers['x-esp8266-sta-mac']
        || !headers['x-esp8266-free-space']
        || !headers['x-esp8266-sketch-size']
        || !headers['x-esp8266-sketch-md5']
        || !headers['x-esp8266-chip-size']
        || !headers['x-esp8266-sdk-version']
        // || !headers['x-esp8266-version']
      ) {
        log(`URL accessed by an unknown source: ${JSON.stringify(headers)}`);
        return res.status(500).send(`Request not coming from an ESP. Aborting!`);
      }

      const chipId = headers['x-esp8266-chip-id'] as string;
      const currentVersion = headers['x-esp8266-version'] as string;
      log(`ESP Chip ${chipId} is using version ${currentVersion}.`);
      log(`\tChecking for new version...`);

      const binaryFile: string = await findBinaryForUpdate(chipId, currentVersion);
      if (binaryFile) {
        log(`\tSending new binary ${binaryFile}...`);
        res.sendFile(binaryFile, err => {
          if (err) {
            log(`\t\tThere was an error sending the binary in path ${binaryFile}:`);
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

      this.gitManager.cloneOrUpdate(libName).pipe(
        switchMap(() => this.githubManager.getNextVersion(libName, releaseType)),
        switchMap(nextVersion => {
          const runner = this.pioBuildManager.create(libName, nextVersion, chipIds);
          return forkJoin([of(nextVersion), this.pioBuildManager.start(runner)]);
        }),
        switchMap(([nextVersion, pioBuildResult]) => this.githubManager.createRelease(libName, nextVersion)),
        switchMap(releaseId => this.githubManager.uploadArchive(libName, releaseId)),
        switchMap(() => this.pioBuildManager.copyBinFiles(libName, chipIds))
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
