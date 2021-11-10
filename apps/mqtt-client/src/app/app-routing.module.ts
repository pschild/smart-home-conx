import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'facility',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'playground',
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
    loadChildren: () => import('./playground/playground.module').then(m => m.PlaygroundModule)
  },
  {
    path: 'facility',
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
    loadChildren: () => import('./facility/facility.module').then(m => m.FacilityModule)
  },
  {
    path: 'preferences',
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
    loadChildren: () => import('./preference/preference.module').then(m => m.PreferenceModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // preloadingStrategy: PreloadAllModules,
    relativeLinkResolution: 'legacy'
})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
