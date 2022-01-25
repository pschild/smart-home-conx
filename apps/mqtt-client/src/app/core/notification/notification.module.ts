import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { CoreModule } from '../../core/core.module';
import { MaterialModule } from '../../material/material.module';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { NotificationState } from './state/notification.state';
import { NotificationMenuComponent } from './notification-menu/notification-menu.component';

@NgModule({
  declarations: [
    NotificationMenuComponent,
    NotificationListComponent,
    NotificationItemComponent
  ],
  exports: [
    NotificationMenuComponent,
    NotificationListComponent,
    NotificationItemComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    CoreModule,
    NgxsModule.forFeature([NotificationState])
  ]
})
export class NotificationModule {
}
