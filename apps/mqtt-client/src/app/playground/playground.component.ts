import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { FormControl } from '@angular/forms';
import { HttpService } from '../http.service';
import { SocketService } from '../socket.service';
import { EventMqttService } from '../event-mqtt.service';
import { map, mergeAll, scan, share, takeUntil, tap, toArray } from 'rxjs/operators';
import { merge, Observable, ReplaySubject } from 'rxjs';
import { EspConfig } from '@smart-home-conx/utils';

@Component({
  selector: 'smart-home-conx-playground',
  templateUrl: './playground.component.html',
})
export class PlaygroundComponent implements OnInit, OnDestroy {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  logMessages$: Observable<string>;

  espConfig$: Observable<EspConfig[]>;

  alexaDevices$: Observable<any>;

  systemLog$: Observable<string[]>;
  movementLog$: Observable<string[]>;
  dhtLog$: Observable<string[]>;

  speachText = new FormControl('');
  commandText = new FormControl('');
  alexaDevice = new FormControl('');

  constructor(
    private httpService: HttpService,
    private eventMqttService: EventMqttService,
    private socketService: SocketService
  ) {
  }

  ngOnInit(): void {
    this.eventMqttService.observe('devices/+/version')
      .subscribe((data: IMqttMessage) => console.log('esp ping', data.payload.toString()));

    this.eventMqttService.observe('adesso-commuter-server/commuting/#')
      .subscribe((data: IMqttMessage) => console.log('commuting', data.payload.toString()));

    this.espConfig$ = this.httpService.getEspConfig();
    this.espConfig$.subscribe(esps => console.log('esps', esps));

    this.alexaDevices$ = this.httpService.getDeviceList();

    this.logMessages$ = merge(
      this.socketService.listen(`esp-motion-sensor/stdout`),
      this.socketService.listen(`esp-motion-sensor/stderr`).pipe(map(data => `[ERROR] ${data}`))
    ).pipe(
      takeUntil(this.destroyed$),
      scan((acc, curr) => `${acc}\n${curr}`, '')
    );

    this.systemLog$ = this.httpService.getLog();
    this.movementLog$ = this.httpService.getMovementLog();
    this.dhtLog$ = this.httpService.getDhtLog();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  sendMessage(): void {
    this.eventMqttService.publish('ESP_7888034/movement', 'foo').subscribe();
  }

  speak(): void {
    this.httpService.speak(this.alexaDevice.value, this.speachText.value).subscribe(console.log);
  }

  sendCommand(): void {
    this.httpService.command(this.alexaDevice.value, this.commandText.value).subscribe(console.log);
  }

  getCommutingHistory(): void {
    this.httpService.commutingHistory().subscribe(console.log);
  }

  triggerPioBuild(): void {
    this.httpService.triggerPioBuild('esp-motion-sensor', 'patch', [3356673, 3356430]).subscribe(console.log);
  }

  killPioBuild(): void {
    this.httpService.killPioBuild().subscribe(console.log);
  }

}
