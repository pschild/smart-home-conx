import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreferenceListComponent } from './preference-list/preference-list.component';
import { PreferenceResolver } from './preference.resolver';

const routes: Routes = [
  {
    path: '',
    resolve: {
      data: PreferenceResolver
    },
    component: PreferenceListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreferenceRoutingModule { }
