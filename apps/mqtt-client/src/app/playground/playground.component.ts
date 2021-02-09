import { Component, OnInit } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { FormControl } from '@angular/forms';
import { HttpService } from '../http.service';
import { SocketService } from '../socket.service';
import { EventMqttService } from '../event-mqtt.service';
import { map, scan, share, takeUntil } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { EspConfig } from '@smart-home-conx/utils';

@Component({
  selector: 'smart-home-conx-playground',
  templateUrl: './playground.component.html',
})
export class PlaygroundComponent implements OnInit {

  logMessages$: Observable<string>;

  espConfig$: Observable<EspConfig[]>;

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
    this.espConfig$.subscribe(esps => console.log(esps));
  }

  sendMessage(): void {
    this.eventMqttService.publish('ESP_7888034/movement', 'foo').subscribe();
  }

  speak(): void {
    this.httpService.speak(this.alexaDevice.value, this.speachText.value).subscribe(console.log);
  }

  sendCommand(): void {
    this.httpService.command(this.commandText.value).subscribe(console.log);
  }

  getCommutingHistory(): void {
    this.httpService.commutingHistory().subscribe(console.log);
  }

  triggerPioBuild(): void {
    const call$ = this.httpService.triggerPioBuild('esp-motion-sensor').pipe(share());

    this.logMessages$ = merge(
      this.socketService.listen(`esp-motion-sensor/stdout`),
      this.socketService.listen(`esp-motion-sensor/stderr`).pipe(map(data => `[ERROR] ${data}`))
    ).pipe(
      takeUntil(call$),
      scan((acc, curr) => `${acc}\n${curr}`, '')
    );

    call$.subscribe(console.log);
  }

  killPioBuild(): void {
    this.httpService.killPioBuild().subscribe(console.log);
  }

}
