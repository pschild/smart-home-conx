import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlaygroundComponent } from './playground.component';
import { PlaygroundResolver } from './playground.resolver';


const routes: Routes = [
  {
    path: '',
    resolve: {
      data: PlaygroundResolver
    },
    component: PlaygroundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlaygroundRoutingModule { }
