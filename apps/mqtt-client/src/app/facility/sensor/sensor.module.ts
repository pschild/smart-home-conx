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

@NgModule({
  declarations: [
    SensorListComponent,
    SensorCreateComponent,
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
