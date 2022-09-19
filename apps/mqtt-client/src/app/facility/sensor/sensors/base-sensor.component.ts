import { Directive, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';

@Directive()
export abstract class BaseSensorComponent implements OnInit {

  @Input() sensor: SensorModel;

  @Input() dragDisabled: boolean;

  history$: Observable<{ time: string; value: number; chipId: string; pin: number; type: SensorType }[]>;
  latest$: Observable<{ time: string; value: number; chipId: string; pin: number; type: SensorType }>;

  SensorType = SensorType;

  protected store: Store;
  protected dialog: MatDialog;

  constructor(
    store: Store,
    dialog: MatDialog
  ) {
    this.store = store;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.history$ = this.store.select(SensorState.history(this.sensor._id.toString(), this.sensor.type));
    this.latest$ = this.store.select(SensorState.latest(this.sensor._id.toString(), this.sensor.type));

    // TODO: wird zu oft geladen (bspw. wenn Sensor verschoben wird)
    this.store.dispatch(new SensorActions.LoadHistory(this.sensor._id.toString(), this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

}
