import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NotificationModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { NotificationState } from '../state/notification.state';

@Component({
  selector: 'smart-home-conx-notification-menu',
  templateUrl: './notification-menu.component.html',
  styleUrls: ['./notification-menu.component.scss']
})
export class NotificationMenuComponent {

  @Select(NotificationState.notifications)
  notifications$: Observable<NotificationModel[]>;

  constructor(
    private store: Store
  ) {
  }

}
