import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NotificationModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { NotificationState } from '../state/notification.state';
import * as NotificationActions from '../state/notification.actions';

@Component({
  selector: 'smart-home-conx-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent {

  @Select(NotificationState.notifications)
  notifications$: Observable<NotificationModel[]>;

  constructor(
    private store: Store
  ) {
  }

  doneAll(): void {
    this.store.dispatch(new NotificationActions.RemoveAll());
  }

}
