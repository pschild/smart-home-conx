import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SensorListComponent } from './sensor-list/sensor-list.component';
import { SensorCreateComponent } from './sensor-create/sensor-create.component';
import { NgxsModule } from '@ngxs/store';
import { SensorState } from './state/sensor.state';
import { SwitchSensorComponent } from './sensors/switch-sensor/switch-sensor.component';
import { MovementSensorComponent } from './sensors/movement-sensor/movement-sensor.component';
import { TemperatureSensorComponent } from './sensors/temperature-sensor/temperature-sensor.component';
import { HumiditySensorComponent } from './sensors/humidity-sensor/humidity-sensor.component';
import { VoltageSensorComponent } from './sensors/voltage-sensor/voltage-sensor.component';
import { RoomComponent } from './room/room.component';
import { UnassignedSensorsComponent } from './unassigned-sensors/unassigned-sensors.component';
import { FloorComponent } from './floor/floor.component';
import { CoreModule } from '../../core/core.module';
import { TemperatureDetailCreateComponent } from './sensor-create/temperature-detail-create/temperature-detail-create.component';
import { HumidityDetailCreateComponent } from './sensor-create/humidity-detail-create/humidity-detail-create.component';
import { MovementDetailCreateComponent } from './sensor-create/movement-detail-create/movement-detail-create.component';
import { VoltageDetailCreateComponent } from './sensor-create/voltage-detail-create/voltage-detail-create.component';
import { SwitchDetailCreateComponent } from './sensor-create/switch-detail-create/switch-detail-create.component';
import { SensorDirective } from './sensors/sensor.directive';
import { HumidityDetailComponent, MovementDetailComponent, SwitchDetailComponent, TemperatureDetailComponent, VoltageDetailComponent } from './sensor-detail';
import { SensorHistoryComponent } from './sensor-history/sensor-history.component';
import { SensorActionButtonsComponent } from './sensor-action-buttons/sensor-action-buttons.component';

@NgModule({
  declarations: [
    SensorListComponent,
    SensorCreateComponent,
    TemperatureDetailCreateComponent,
    HumidityDetailCreateComponent,
    MovementDetailCreateComponent,
    VoltageDetailCreateComponent,
    SwitchDetailCreateComponent,
    VoltageSensorComponent,
    SensorDirective,
    SwitchSensorComponent,
    MovementSensorComponent,
    TemperatureSensorComponent,
    HumiditySensorComponent,
    RoomComponent,
    UnassignedSensorsComponent,
    FloorComponent,

    SensorHistoryComponent,
    SensorActionButtonsComponent,

    TemperatureDetailComponent,
    HumidityDetailComponent,
    SwitchDetailComponent,
    MovementDetailComponent,
    VoltageDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CoreModule,
    NgxsModule.forFeature([SensorState]),
    NgxChartsModule
  ]
})
export class SensorModule {
}
