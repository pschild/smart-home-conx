import * as express from 'express';
import { Application, Request, Response } from 'express';
import * as path from 'path';
import { findBinaryForUpdate } from './app/binary.provider';
import { log } from '@smart-home-poc/utils';

const app: Application = express();
const port = 9042;

app.use(express.static(path.join(__dirname, 'binfiles')));

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

app.listen(port, () => {
  log(`running at http://localhost:${port}`);
});
