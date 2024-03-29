import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { OpenWeatherMapModule } from '../external-systems/openweathermap/openweathermap.module';
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
    OpenWeatherMapModule,
    TankerkoenigModule,
    NgxsModule.forFeature([PlaygroundState])
  ]
})
export class PlaygroundModule {
}
