import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DeviceModule } from './device/device.module';
import { SensorModule } from './sensor/sensor.module';
import { FacilityRoutingModule } from './facility-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FacilityRoutingModule,
    DeviceModule,
    SensorModule
  ]
})
export class FacilityModule {
}
