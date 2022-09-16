import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { PreferenceService } from '@smart-home-conx/preference';
import { isDocker } from '@smart-home-conx/utils';
import { add, format } from 'date-fns';
import { map, switchMap, tap } from 'rxjs/operators';
import { CommutingService } from './commuting.service';
import { TrafficDelay } from './maps-crawler';
import { TravelTimeService } from './travel-time.service';

@Controller()
export class CommutingController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(
    private readonly commutingService: CommutingService,
    private readonly travelTimeService: TravelTimeService,
    private readonly preferenceService: PreferenceService
  ) {}

  @Post('commuting-state')
  async updateState(@Body() dto: { newState: 'START' | 'END' | 'CANCELLED' }) {
    const newState = dto.newState;

    this.mqttClient.emit('commuting-watcher/commuting/status', newState);
    const alexaEnabled = await this.preferenceService.getValueFor('alexaEnabled');

    switch (newState) {
      case 'START':
        this.mqttClient.emit('commuting-watcher/commuting/status/start', format(new Date(), 'HH:mm'));
        this.mqttClient.emit('telegram/message', `🟢‍💨🚗 Pendeln gestartet!`);
        if (alexaEnabled) {
          this.mqttClient.emit('alexa/in/speak', { message: `Ich fahre jetzt los.` });
          this.mqttClient.emit('alexa/in/automation', { device: 'Philippes Echo Flex', message: 'SHCNormalerVerkehr' });
        }
        break;
      case 'END':
        this.mqttClient.emit('commuting-watcher/commuting/status/end', format(new Date(), 'HH:mm'));
        this.mqttClient.emit('telegram/message', `‍💨🚗🏁 Ziel erreicht!`);
        if (alexaEnabled) {
          this.mqttClient.emit('alexa/in/speak', { message: `Ich bin angekommen.` });
          this.mqttClient.emit('alexa/in/automation', { device: 'Philippes Echo Flex', message: 'SHCReset' });
        }
        break;
      case 'CANCELLED':
        this.mqttClient.emit('commuting-watcher/commuting/status/cancelled', format(new Date(), 'HH:mm'));
        this.mqttClient.emit('telegram/message', `❌🚗 Pendeln abgebrochen!`);
        this.mqttClient.emit('alexa/in/automation', { device: 'Philippes Echo Flex', message: 'SHCReset' });
        break;
      default:
        throw new Error(`Unknown commuting state ${newState}`);
    }

    this.mqttClient.emit('log', {source: 'commuting-watcher', message: `Changed commuting state to ${newState}`});
    this.commutingService.saveState(newState);

    return { newState };
  }

  @Get('commuting-state/latest')
  async getLatestState() {
    return this.commutingService.getLatestState();
  }

  @Get('from/:startLatLng/to/:destinationLatLng')
  getDuration(@Param('startLatLng') startLatLng: string, @Param('destinationLatLng') destinationLatLng: string) {
    const startParts = startLatLng.split(',');
    const destinationParts = destinationLatLng.split(',');

    const durations$ = this.travelTimeService.getDurations(
      { latitude: +startParts[0], longitude: +startParts[1] },
      { latitude: +destinationParts[0], longitude: +destinationParts[1] }
    );
    return durations$.pipe(
      tap(async (durations) => {
        const minResult = durations.reduce((prev, curr) => prev.minutes < curr.minutes ? prev : curr);
        const eta = format(add(new Date(), { minutes: minResult.minutes }), 'HH:mm');
        this.mqttClient.emit('log', {source: 'commuting-watcher', message: `${startLatLng} -> ${destinationLatLng}: duration=${minResult.minutes}, distance=${minResult.distance}`});
        this.mqttClient.emit('commuting-watcher/commuting/duration/minutes-left', minResult.minutes.toString());
        this.mqttClient.emit('commuting-watcher/commuting/duration/eta', eta);
        if (await this.preferenceService.getValueFor('alexaEnabled')) {
          // this.mqttClient.emit('alexa/in/speak', { message: `Ankunft in ca. ${minutesLeft} Minuten.` });
          this.mqttClient.emit('alexa/in/speak', { message: `Ankunft um ${eta}` });
          this.mqttClient.emit('alexa/in/automation', { device: 'Philippes Echo Flex', message: this.getTrafficRoutineName(minResult.delay) });
        }
        this.mqttClient.emit('telegram/message', `‍💨🚗 Ankunft um ${eta} Uhr.`);
      }),
      switchMap(durations => this.commutingService.saveDurations(startParts, destinationParts, durations).pipe(
        map(_ => ({
          durations,
          average: durations.map(item => item.minutes).reduce((prev, curr) => prev + curr) / durations.length,
        }))
      ))
    );
  }

  @Get('coordinates')
  async getCoordinates() {
    return [
      { name: 'HOME', lat: +process.env.HOME_POSITION_LAT, lon: +process.env.HOME_POSITION_LON },
      { name: 'WORK', lat: +process.env.WORK_POSITION_LAT, lon: +process.env.WORK_POSITION_LON },
    ];
  }

  private getTrafficRoutineName(delayType: TrafficDelay): string {
    switch (delayType) {
      case TrafficDelay.HEAVY:
        return 'SHCVielVerkehr';
      case TrafficDelay.MEDIUM:
        return 'SHCMediumVerkehr';
      case TrafficDelay.LIGHT:
      case TrafficDelay.DEFAULT:
        return 'SHCNormalerVerkehr';
    }
  }

}
