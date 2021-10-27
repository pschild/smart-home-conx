import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SensorListComponent } from './sensor-list/sensor-list.component';
import { SensorResolver } from './sensor.resolver';

const routes: Routes = [
  {
    path: '',
    resolve: {
      data: SensorResolver
    },
    component: SensorListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SensorRoutingModule { }
