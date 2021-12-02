import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommutingComponent } from './commuting.component';

const routes: Routes = [
  {
    path: '',
    component: CommutingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommutingRoutingModule { }
