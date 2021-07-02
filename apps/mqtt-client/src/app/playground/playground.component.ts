import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { FormControl } from '@angular/forms';
import { HttpService } from '../http.service';
import { SocketService } from '../socket.service';
import { EventMqttService } from '../event-mqtt.service';
import { map, scan, takeUntil } from 'rxjs/operators';
import { merge, Observable, ReplaySubject } from 'rxjs';
import { EspConfig } from '@smart-home-conx/utils';
import { Select, Store } from '@ngxs/store';
import { PlaygroundState } from './state/playground.state';
import { DeviceState } from '../device/state/device.state';
import { PlaygroundActions } from './state/playground.actions';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'smart-home-conx-playground',
  templateUrl: './playground.component.html',
  styles: [
    `
    .sensor {
      cursor: move;
    }

    .room .sensor {
      position: absolute;
    }

    #unassigned-list > div {
      text-align: center;
    }

    .cdk-drag-placeholder {
      display: none;
    }

    .cdk-drop-list-dragging {
      border-style: dashed !important;
    }
    `
  ]
})
export class PlaygroundComponent implements OnInit, OnDestroy {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  logMessages$: Observable<string>;

  @Select(DeviceState.espList)
  espConfig$: Observable<EspConfig[]>;

  espRepos$: Observable<string[]>;

  systemLog$: Observable<string[]>;
  movementLog$: Observable<string[]>;

  @Select(PlaygroundState.dhtValues)
  dhtLog$: Observable<string[]>;

  @Select(PlaygroundState.latestTemperature)
  latestTemperature$: Observable<any>;

  latestVoltage$: Observable<string>;

  topic = new FormControl('devices/ESP_12974077/dht');
  payload = new FormControl('{"temperature":18.9,"humidity":56.6}');

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
    this.store.dispatch(new PlaygroundActions.LoadDhtHistory());

    this.eventMqttService.observe('devices/+/version')
      .subscribe((data: IMqttMessage) => console.log('esp ping', data.payload.toString()));

    this.eventMqttService.observe('adesso-commuter-server/commuting/#')
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
    this.movementLog$ = this.httpService.getMovementLog();

    this.latestVoltage$ = merge(
      this.httpService.getLatestVoltage('ESP_12974077'),
      this.eventMqttService.observe('devices/ESP_12974077/voltage').pipe(map(res => res.payload.toString()))
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  sendMessage(): void {
    this.eventMqttService.publish(this.topic.value, this.payload.value).subscribe();
  }

  getCommutingHistory(): void {
    this.httpService.commutingHistory().subscribe(console.log);
  }

  triggerPioBuild(): void {
    this.httpService.triggerPioBuild(this.libName.value, this.releaseType.value, this.chipIds.value).subscribe(console.log);
  }

  killPioBuild(): void {
    this.httpService.killPioBuild().subscribe(console.log);
  }

  // tslint:disable-next-line:member-ordering
  rooms$ = this.store.select(PlaygroundState.rooms);
  // tslint:disable-next-line:member-ordering
  sensors$ = this.store.select(PlaygroundState.sensors);
  // tslint:disable-next-line:member-ordering
  unassignedSensors$ = this.store.select(PlaygroundState.unassignedSensors);

  drop(event: CdkDragDrop<any>) {
    if (event.container.id === 'unassigned-list') {
      this.removeFromRoom(event.item.data);
    } else {
      this.store.dispatch(new PlaygroundActions.UpdateSensor(
        event.item.data._id, // sensor id
        event.container.data._id, // new room id
        this.getNewPosition(event) // new position
      ));
    }
  }

  private getNewPosition(event: CdkDragDrop<any>): { x: number; y: number } {
    if (event.container.id === event.previousContainer.id) {
      return {
        x: event.isPointerOverContainer ? event.item.data.position.x + event.distance.x : event.item.data.position.x,
        y: event.isPointerOverContainer ? event.item.data.position.y + event.distance.y : event.item.data.position.y
      };
    }
    const dragRect = event.item.element.nativeElement.getBoundingClientRect();
    const dropRect = event.container.element.nativeElement.getBoundingClientRect();
    return {
      x: event.isPointerOverContainer ? event.dropPoint.x - dropRect.x - dragRect.width / 2 : 0,
      y: event.isPointerOverContainer ? event.dropPoint.y - dropRect.y - dragRect.height / 2 : 0
    };
  }

  removeFromRoom(sensor): void {
    this.store.dispatch(new PlaygroundActions.UpdateSensor(
      sensor._id, // sensor id
      null, // new room id
      null // new position
    ));
  }

  getIconName(type: string): string {
    switch (type) {
      case 'dht':
        return 'thermostat';
      case 'battery':
        return 'battery_charging_full';
      default:
        throw new Error(`Unknown sensor type "${type}"!`);
    }
  }

}
