import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { MaterialModule } from '../material/material.module';
import { PreferenceModule } from '../preference/preference.module';
import { PlaygroundRoutingModule } from './playground-routing.module';
import { PlaygroundComponent } from './playground.component';
import { PlaygroundState } from './state/playground.state';

@NgModule({
  declarations: [
    PlaygroundComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PlaygroundRoutingModule,
    MaterialModule,
    PreferenceModule,
    NgxsModule.forFeature([PlaygroundState])
  ]
})
export class PlaygroundModule {
}
