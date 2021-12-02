import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from './time-ago.pipe';
import { ConnectionStatusIndicatorComponent } from './connection-status-indicator/connection-status-indicator.component';

@NgModule({
  declarations: [
    ConnectionStatusIndicatorComponent,
    TimeAgoPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ConnectionStatusIndicatorComponent,
    TimeAgoPipe
  ]
})
export class CoreModule {
}
