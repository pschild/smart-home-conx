import { Injectable } from '@angular/core';
import { createSelector, State, StateContext, StateToken, Store } from '@ngxs/store';
import { SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { EventMqttService } from '../../../../event-mqtt.service';
import { SensorUtil } from '../../sensor.util';
import { SensorState } from '../../state/sensor.state';

export const SENSOR_CHART_STATE_NAME = new StateToken<SensorChartStateModel>('sensorChart');

export interface SensorChartStateModel {
  history: { [sensorId: string]: { time: string; value: number; chipId: string; pin: number; type: SensorType }[] };
}

@State<SensorChartStateModel>({
  name: SENSOR_CHART_STATE_NAME,
  defaults: {
    history: {},
  }
})
@Injectable()
export class SensorChartState {

  constructor(
    private eventMqttService: EventMqttService,
    private store: Store,
  ) {}

  static chartData(sensorId: string, type: SensorType) {
    return createSelector([SensorState.history(sensorId, type)], (history: { time: string; value: number; chipId: string; pin: number; type: SensorType }[]) => {
      const series = history
        .filter(item => item.value !== null)
        .sort((a, b) => a.time.localeCompare(b.time))
        .map(item => ({ name: new Date(item.time), value: item.value }));

      return !!series && series.length > 1 ? [{ name: SensorUtil.getSuffixByType(type) || 'Wert', series }] : [];
    });
  }

  static max(sensorId: string, type: SensorType) {
    return createSelector([SensorState.history(sensorId, type)], (history: { time: string; value: number; chipId: string; pin: number; type: SensorType }[]) => {
      return !!history && history.length > 0 ? Math.max(...history.map(item => item.value)) : null;
    });
  }

  static min(sensorId: string, type: SensorType) {
    return createSelector([SensorState.history(sensorId, type)], (history: { time: string; value: number; chipId: string; pin: number; type: SensorType }[]) => {
      return !!history && history.length > 0 ? Math.min(...history.map(item => item.value)) : null;
    });
  }

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit sensor-chart.state');
  }

}
