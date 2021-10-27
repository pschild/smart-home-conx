import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'devices',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'playground',
    canActivate: [AuthGuard],
    loadChildren: () => import('./playground/playground.module').then(m => m.PlaygroundModule)
  },
  {
    path: 'devices',
    canActivate: [AuthGuard],
    loadChildren: () => import('./device/device.module').then(m => m.DeviceModule)
  },
  {
    path: 'sensors',
    canActivate: [AuthGuard],
    loadChildren: () => import('./sensor/sensor.module').then(m => m.SensorModule)
  },
  {
    path: 'preferences',
    canActivate: [AuthGuard],
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
