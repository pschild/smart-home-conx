import { Controller, Get, Param } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { PreferenceService } from '@smart-home-conx/preference';
import { isDocker } from '@smart-home-conx/utils';
import { add, format } from 'date-fns';
import { map, switchMap, tap } from 'rxjs/operators';
import { CommutingService } from './commuting.service';
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

  @Get('commuting-state/:state')
  async updateState(@Param('state') newState: 'START' | 'END' | 'CANCELLED') {
    this.mqttClient.emit('commuting-watcher/commuting/status', newState);
    const alexaEnabled = await this.preferenceService.getValueFor('alexaEnabled');

    switch (newState) {
      case 'START':
        this.mqttClient.emit('commuting-watcher/commuting/status/start', format(new Date(), 'HH:mm'));
        if (alexaEnabled) {
          this.mqttClient.emit('alexa/in/speak', { device: 'Philippes Echo Flex', message: `Ich fahre jetzt los.` });
        }
        break;
      case 'END':
        this.mqttClient.emit('commuting-watcher/commuting/status/end', format(new Date(), 'HH:mm'));
        if (alexaEnabled) {
          this.mqttClient.emit('alexa/in/speak', { device: 'Philippes Echo Flex', message: `Ich bin angekommen.` });
        }
        break;
      case 'CANCELLED':
        this.mqttClient.emit('commuting-watcher/commuting/status/cancelled', format(new Date(), 'HH:mm'));
        break;
      default:
        throw new Error(`Unknown commuting state ${newState}`);
    }

    this.mqttClient.emit('log', {source: 'commuting-watcher', message: `Changed commuting state to ${newState}`});
    this.commutingService.saveState(newState);

    return { newState };
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
        const minutesLeft = Math.min(...durations);
        // const eta = add(new Date(), { minutes: minutesLeft });
        this.mqttClient.emit('log', {source: 'commuting-watcher', message: `Duration from ${startLatLng} to ${destinationLatLng}: ${minutesLeft}`});
        this.mqttClient.emit('commuting-watcher/commuting/duration/minutes-left', minutesLeft.toString());
        this.mqttClient.emit('commuting-watcher/commuting/duration/eta', format(add(new Date(), { minutes: minutesLeft }), 'HH:mm'));
        if (await this.preferenceService.getValueFor('alexaEnabled')) {
          this.mqttClient.emit('alexa/in/speak', { device: 'Philippes Echo Flex', message: `Ankunft in ca. ${minutesLeft} Minuten.` });
        }
      }),
      switchMap(durations => this.commutingService.saveDurations(startParts, destinationParts, durations).pipe(
        map(_ => ({
          durations,
          average: durations.reduce((prev, curr) => prev + curr) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations)
        }))
      ))
    );
  }

}
