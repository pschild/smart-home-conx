import { Controller, Logger } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { NotificationContext, NotificationModelUtil, WeatherDataResponse } from '@smart-home-conx/api/shared/data-access/models';
import { isDocker } from '@smart-home-conx/utils';
import { merge, Subject } from 'rxjs';
import { filter, map, mergeMap, scan } from 'rxjs/operators';

interface PayloadWithDate {
  datetime: Date;
  type: 'temperature' | 'humidity';
  chipId: number;
  value: number;
}

interface TempHumPair {
  temp: PayloadWithDate;
  hum: PayloadWithDate;
}

interface ScanResult {
  payload: PayloadWithDate[];
  pair?: TempHumPair;
}

@Controller()
export class VentilationController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'third-party-api' : 'localhost' } })
  thirdPartyApiClient: ClientProxy;

  tempStream$ = new Subject<PayloadWithDate>();
  humStream$ = new Subject<PayloadWithDate>();

  constructor() {
    merge(this.tempStream$, this.humStream$).pipe(
      scan((acc: ScanResult, cur: PayloadWithDate) => {
        // TODO: Items die älter als x Minuten sind aus acc herausfiltern
        const itemWithSameChipId = acc.payload.find(i => i.chipId === cur.chipId);
        if (itemWithSameChipId) {
          const itemsWithDifferentChipId = acc.payload.filter(i => i.chipId !== cur.chipId);
          if (itemWithSameChipId.type === cur.type) {
            return { payload: [...itemsWithDifferentChipId, cur] }; // overwrite in acc
          } else {
            return {
              payload: itemsWithDifferentChipId,
              pair: {
                temp: [itemWithSameChipId, cur].find(i => i.type === 'temperature'),
                hum: [itemWithSameChipId, cur].find(i => i.type === 'humidity')
              }
            }; // remove from acc + emit pair
          }
        } else {
          return { payload: [...acc.payload, cur] }; // add to acc
        }
      }, { payload: [] }),
      map((res: ScanResult) => res.pair),
      filter((pair: TempHumPair) => !!pair && !!pair.temp && !!pair.hum && pair.temp.chipId === pair.hum.chipId),
      mergeMap((pair: TempHumPair) => this.thirdPartyApiClient.send<WeatherDataResponse>('currentWeather', {}).pipe(
        map((response: WeatherDataResponse) => ({
          inside: { temp: pair.temp, hum: pair.hum },
          outside: { temp: response.temp as unknown as number, hum: response.humidity }
        }))
      )),
    ).subscribe(data => {
      const wassergehaltLuftInnen = this.wassergehaltLuft(data.inside.temp.value, data.inside.hum.value);
      const wassergehaltLuftAussen = this.wassergehaltLuft(data.outside.temp, data.outside.hum);

      /**
       * Empfehlungen
       * ------------
       * Badezimmer 20-23°C 50-70%
       * Kinderzimmer 20-23°C 40-60%
       * Wohnzimmer 20-23°C 40-60%
       * Arbeitszimmer 20-23°C 40-60%
       * Kueche 18-20°C 50-60%
       * Schlafzimmer 17-20°C 40-60%
       * Flur 15-18°C 40-60%
       * Keller 10-15°C 50-65%
       */

      if (data.inside.hum.value > 60) {
        this.mqttClient.emit(
          'notification-manager/notification/create',
          NotificationModelUtil.createHighPriority(NotificationContext.WEATHER, `Zu hohe Luftfeuchtigkeit`, `Die Luftfeuchtigkeit ist zu hoch: ${data.inside.hum.value}`)
        );
      }

      if (wassergehaltLuftInnen / wassergehaltLuftAussen >= 1.3) {
        this.mqttClient.emit(
          'notification-manager/notification/create',
          NotificationModelUtil.createMediumPriority(NotificationContext.WEATHER, `Lüften!`, `Lüften lohnt sich!\nInnen: ${data.inside.temp.value}°C/${data.inside.hum.value}% => ${wassergehaltLuftInnen}g/m³\nAußen: ${data.outside.temp}°C/${data.outside.hum}% => ${wassergehaltLuftAussen}g/m³`)
        );
      }
    });
  }

  @MessagePattern('sensor-connector/devices/+/temperature/corrected')
  onCorrectedTemperature(@Payload() payload: { value: number }, @Ctx() context: MqttContext) {
    const chipIdMatch = context.getTopic().match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${context.getTopic()}`);
    }
    const chipId = +chipIdMatch[1];

    this.tempStream$.next({ datetime: new Date(), type: 'temperature', chipId, ...payload });
  }

  @MessagePattern('sensor-connector/devices/+/humidity/corrected')
  onCorrectedHumidity(@Payload() payload: { value: number }, @Ctx() context: MqttContext) {
    const chipIdMatch = context.getTopic().match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${context.getTopic()}`);
    }
    const chipId = +chipIdMatch[1];

    this.humStream$.next({ datetime: new Date(), type: 'humidity', chipId, ...payload });
  }

  /**
   * 
   * @param temperature The temperature in °C, example: 21.6
   * @param humidity The humidity as a percent value between 0 and 1, example: 0.64. If a value > 1 is passed it will be converted.
   * @returns wassergehaltLuft (g/m³)
   */
  private wassergehaltLuft(temperature: number, humidity: number): number {
    if (humidity > 1) {
      Logger.log(`Auto-converting humidity ${humidity} to ${humidity / 100}`);
      humidity /= 100;
    }

    const wasserdampfSaettingungsdruck = temperature > 0
      ? 288.68 * Math.pow(1.098 + temperature / 100, 8.02)
      : 4.689 * Math.pow(1.486 + temperature / 100, 12.3);
    const wasserdampfTeildruck = humidity * wasserdampfSaettingungsdruck;
    const wassergehaltLuft = 216.7 * wasserdampfTeildruck * 0.01 / (temperature + 273.15);
    return wassergehaltLuft;
  }

}
