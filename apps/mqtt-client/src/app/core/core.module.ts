import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from './time-ago.pipe';
import { ConnectionStatusIndicatorComponent } from './connection-status-indicator/connection-status-indicator.component';
import { CountdownPipe } from './countdown.pipe';

@NgModule({
  declarations: [
    ConnectionStatusIndicatorComponent,
    TimeAgoPipe,
    CountdownPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ConnectionStatusIndicatorComponent,
    TimeAgoPipe,
    CountdownPipe
  ]
})
export class CoreModule {
}
