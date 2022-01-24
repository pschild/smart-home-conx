import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { CoreModule } from '../../core/core.module';
import { MaterialModule } from '../../material/material.module';
import { WeatherComponent } from './weather.component';
import { OpenWeatherMapState } from './state/openweathermap.state';

@NgModule({
  declarations: [
    WeatherComponent
  ],
  exports: [
    WeatherComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CoreModule,
    NgxsModule.forFeature([OpenWeatherMapState])
  ]
})
export class OpenWeatherMapModule {
}
