import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { NgxsModule } from '@ngxs/store';
import { PreferenceState } from './state/preference.state';
import { PreferenceListComponent } from './preference-list/preference-list.component';
import { PreferenceRoutingModule } from './preference-routing.module';
import { PreferenceItemComponent } from './preference-item/preference-item.component';

@NgModule({
  declarations: [
    PreferenceListComponent,
    PreferenceItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PreferenceRoutingModule,
    MaterialModule,
    NgxsModule.forFeature([PreferenceState])
  ]
})
export class PreferenceModule {
}
