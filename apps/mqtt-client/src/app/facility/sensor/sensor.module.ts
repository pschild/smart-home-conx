import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { SensorListComponent } from './sensor-list/sensor-list.component';
import { SensorCreateComponent } from './sensor-create/sensor-create.component';
import { NgxsModule } from '@ngxs/store';
import { SensorState } from './state/sensor.state';
import { SensorComponent } from './sensor/sensor.component';
import { RoomComponent } from './room/room.component';
import { UnassignedSensorsComponent } from './unassigned-sensors/unassigned-sensors.component';
import { FloorComponent } from './floor/floor.component';
import { CoreModule } from '../../core/core.module';
import { TemperatureDetailCreateComponent } from './sensor-create/temperature-detail-create/temperature-detail-create.component';
import { HumidityDetailCreateComponent } from './sensor-create/humidity-detail-create/humidity-detail-create.component';
import { MovementDetailCreateComponent } from './sensor-create/movement-detail-create/movement-detail-create.component';
import { VoltageDetailCreateComponent } from './sensor-create/voltage-detail-create/voltage-detail-create.component';
import { SwitchDetailCreateComponent } from './sensor-create/switch-detail-create/switch-detail-create.component';

@NgModule({
  declarations: [
    SensorListComponent,
    SensorCreateComponent,
    TemperatureDetailCreateComponent,
    HumidityDetailCreateComponent,
    MovementDetailCreateComponent,
    VoltageDetailCreateComponent,
    SwitchDetailCreateComponent,
    SensorComponent,
    RoomComponent,
    UnassignedSensorsComponent,
    FloorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CoreModule,
    NgxsModule.forFeature([SensorState])
  ]
})
export class SensorModule {
}
