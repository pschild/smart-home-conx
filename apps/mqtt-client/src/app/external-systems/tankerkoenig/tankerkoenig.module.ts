import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { CoreModule } from '../../core/core.module';
import { MaterialModule } from '../../material/material.module';
import { PricesComponent } from './prices.component';
import { TankerkoenigState } from './state/tankerkoenig.state';

@NgModule({
  declarations: [
    PricesComponent
  ],
  exports: [
    PricesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CoreModule,
    NgxsModule.forFeature([TankerkoenigState])
  ]
})
export class TankerkoenigModule {
}
