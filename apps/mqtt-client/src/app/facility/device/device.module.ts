import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { DeviceListComponent } from './device-list/device-list.component';
import { DeviceCreateComponent } from './device-create/device-create.component';
import { AlexaDetailsComponent } from './alexa-details/alexa-details.component';
import { NgxsModule } from '@ngxs/store';
import { DeviceState } from './state/device.state';

@NgModule({
  declarations: [
    DeviceListComponent,
    DeviceCreateComponent,
    AlexaDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxsModule.forFeature([DeviceState])
  ]
})
export class DeviceModule {
}
