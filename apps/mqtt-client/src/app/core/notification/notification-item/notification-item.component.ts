import { Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { NotificationModel, Priority } from '@smart-home-conx/api/shared/data-access/models';
import * as NotificationActions from '../state/notification.actions';

@Component({
  selector: 'smart-home-conx-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent {

  @Input() notification: NotificationModel;

  Priority = Priority;

  constructor(
    private store: Store
  ) {
  }

  done(id: string): void {
    this.store.dispatch(new NotificationActions.Remove(id));
  }

}
