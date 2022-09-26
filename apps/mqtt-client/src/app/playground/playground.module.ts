import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { WeatherModule } from '../external-systems/weather/weather.module';
import { TankerkoenigModule } from '../external-systems/tankerkoenig/tankerkoenig.module';
import { MaterialModule } from '../material/material.module';
import { PlaygroundRoutingModule } from './playground-routing.module';
import { PlaygroundComponent } from './playground.component';
import { PlaygroundState } from './state/playground.state';

@NgModule({
  declarations: [
    PlaygroundComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PlaygroundRoutingModule,
    MaterialModule,
    WeatherModule,
    TankerkoenigModule,
    NgxsModule.forFeature([PlaygroundState])
  ]
})
export class PlaygroundModule {
}
