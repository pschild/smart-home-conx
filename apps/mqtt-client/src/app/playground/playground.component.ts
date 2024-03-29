import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { EspConfig } from '@smart-home-conx/utils';
import { IMqttMessage } from 'ngx-mqtt';
import { merge, Observable, ReplaySubject } from 'rxjs';
import { map, scan, takeUntil } from 'rxjs/operators';
import { DeviceState } from '../facility/device/state/device.state';
import { EventMqttService } from '../event-mqtt.service';
import { HttpService } from '../http.service';
import { SocketService } from '../socket.service';

@Component({
  selector: 'smart-home-conx-playground',
  templateUrl: './playground.component.html',
  styles: []
})
export class PlaygroundComponent implements OnInit, OnDestroy {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  logMessages$: Observable<string>;

  @Select(DeviceState.espList)
  espConfig$: Observable<EspConfig[]>;

  espRepos$: Observable<string[]>;

  systemLog$: Observable<string[]>;

  topic = new FormControl('devices/3357047/temperature');
  payload = new FormControl('{"value":21.5, "pin":2}');

  libName = new FormControl('');
  releaseType = new FormControl('');
  chipIds = new FormControl([]);

  constructor(
    private httpService: HttpService,
    private eventMqttService: EventMqttService,
    private socketService: SocketService,
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.eventMqttService.observe('commuting-watcher/commuting/#')
      .subscribe((data: IMqttMessage) => console.log('commuting', data.payload.toString()));

    this.espRepos$ = this.httpService.getEspRepos();

    this.logMessages$ = merge(
      this.socketService.listen(`esp-motion-sensor/stdout`),
      this.socketService.listen(`esp-motion-sensor/stderr`).pipe(map(data => `[ERROR] ${data}`))
    ).pipe(
      takeUntil(this.destroyed$),
      scan((acc, curr) => `${acc}\n${curr}`, '')
    );

    this.systemLog$ = this.httpService.getLog();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  sendMessage(): void {
    this.eventMqttService.publish(this.topic.value, this.payload.value).subscribe();
  }

  applyAndSend(chipId, type, value, pin?: number) {
    this.eventMqttService.publish(`devices/${chipId}/${type}`, `{"value":${value}${!!pin ? ',"pin":' + pin : ''}}`).subscribe();
  }

  triggerPioBuild(): void {
    this.httpService.triggerPioBuild(this.libName.value, this.releaseType.value, this.chipIds.value).subscribe(console.log);
  }

  killPioBuild(): void {
    this.httpService.killPioBuild().subscribe(console.log);
  }

}
