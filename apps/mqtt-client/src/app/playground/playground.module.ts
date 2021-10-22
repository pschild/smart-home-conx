import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaygroundRoutingModule } from './playground-routing.module';
import { PlaygroundComponent } from './playground.component';
import { SensorComponent } from './sensor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { NgxsModule } from '@ngxs/store';
import { PlaygroundState } from './state/playground.state';
import { PreferenceModule } from '../preference/preference.module';
import { RoomComponent } from './room.component';
import { UnassignedSensorsComponent } from './unassigned-sensors.component';
import { FloorComponent } from './floor.component';

@NgModule({
  declarations: [
    PlaygroundComponent,
    SensorComponent,
    RoomComponent,
    UnassignedSensorsComponent,
    FloorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PlaygroundRoutingModule,
    MaterialModule,
    PreferenceModule,
    NgxsModule.forFeature([PlaygroundState])
  ]
})
export class PlaygroundModule {
}
