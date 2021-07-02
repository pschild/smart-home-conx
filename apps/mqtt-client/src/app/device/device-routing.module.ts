import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeviceListComponent } from './device-list/device-list.component';
import { DeviceResolver } from './device.resolver';

const routes: Routes = [
  {
    path: '',
    resolve: {
      data: DeviceResolver
    },
    component: DeviceListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceRoutingModule { }
