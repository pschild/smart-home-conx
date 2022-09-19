import { Component, forwardRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { differenceInSeconds } from 'date-fns';
import { interval, Observable } from 'rxjs';
import { endWith, filter, map, switchMap, takeWhile } from 'rxjs/operators';
import { MovementDetailComponent } from '../../sensor-detail';
import { BaseSensorComponent } from '../base-sensor.component';
import { BASE_SENSOR_TOKEN } from '../base-sensor.token';

@Component({
  selector: 'smart-home-conx-movement-sensor',
  templateUrl: './movement-sensor.component.html',
  styleUrls: ['./movement-sensor.component.scss', '../sensor.scss'],
  providers: [
    {
      provide: BASE_SENSOR_TOKEN,
      useExisting: forwardRef(() => MovementSensorComponent)
    }
  ]
})
export class MovementSensorComponent extends BaseSensorComponent implements OnInit {

  triggeredRecently$: Observable<boolean>;

  constructor(
    store: Store,
    dialog: MatDialog,
  ) {
    super(store, dialog);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.triggeredRecently$ = this.latest$.pipe(
      filter(latest => !!latest),
      switchMap(latest => interval(1000).pipe(
        map(_ => differenceInSeconds(new Date(), new Date(latest.time)) <= 10),
        takeWhile(triggeredRecently => triggeredRecently),
        endWith(false)
      )),
    );
  }

  openDetails(): void {
    this.dialog.open(MovementDetailComponent, { autoFocus: false, data: { sensor: this.sensor } });
  }
}
