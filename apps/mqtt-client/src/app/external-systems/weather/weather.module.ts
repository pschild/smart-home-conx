import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { CoreModule } from '../../core/core.module';
import { MaterialModule } from '../../material/material.module';
import { WeatherComponent } from './weather.component';
import { WeatherState } from './state/weather.state';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { WeatherForecastMinutelyComponent } from './weather-forecast-minutely/weather-forecast-minutely.component';

@NgModule({
  declarations: [
    WeatherComponent,
    WeatherForecastMinutelyComponent,
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
    NgxsModule.forFeature([WeatherState]),
    NgxChartsModule
  ]
})
export class WeatherModule {
}
