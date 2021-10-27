import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth.guard';
import { DeviceListComponent } from './device/device-list/device-list.component';
import { SensorListComponent } from './sensor/sensor-list/sensor-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'sensors',
    pathMatch: 'full'
  },
  {
    path: 'devices',
    canActivate: [AuthGuard],
    component: DeviceListComponent
  },
  {
    path: 'sensors',
    canActivate: [AuthGuard],
    component: SensorListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacilityRoutingModule { }
