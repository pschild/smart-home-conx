import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { NgxsModule } from '@ngxs/store';
import { CommutingState } from './state/commuting.state';
import { CommutingRoutingModule } from './commuting-routing.module';
import { CommutingComponent } from './commuting.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [
    CommutingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    CommutingRoutingModule,
    MaterialModule,
    NgxsModule.forFeature([CommutingState])
  ]
})
export class CommutingModule {
}
