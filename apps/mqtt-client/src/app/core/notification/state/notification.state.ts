import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { insertItem, patch, removeItem } from '@ngxs/store/operators';
import { NotificationModel } from '@smart-home-conx/api/shared/data-access/models';
import { tap } from 'rxjs/operators';
import { EventMqttService } from '../../../event-mqtt.service';
import { NotificationHttpService } from './notification-http.service';
import { NotificationStateUtil } from './notification-state.util';
import * as NotificationActions from './notification.actions';

export const NOTIFICATION_STATE_NAME = new StateToken<NotificationStateModel>('notification');

export interface NotificationStateModel {
  notifications: NotificationModel[];
}

@State<NotificationStateModel>({
  name: NOTIFICATION_STATE_NAME,
  defaults: {
    notifications: []
  }
})
@Injectable()
export class NotificationState implements NgxsOnInit {

  @Selector()
  static notifications(state: NotificationStateModel) {
    return state.notifications.sort(NotificationStateUtil.sortByPriorityAndCreatedAt);
  }

  constructor(
    private notificationHttpService: NotificationHttpService,
    private eventMqttService: EventMqttService
  ) {}

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit notification.state');
    ctx.dispatch(new NotificationActions.LoadAll());

    this.eventMqttService.observe(`notification-manager/notification/created`).subscribe(res => {
      const notification = JSON.parse(res.payload.toString()).data.notification as NotificationModel;
      ctx.setState(patch({
        notifications: insertItem(notification)
      }));
    });
    this.eventMqttService.observe(`notification-manager/notification/removed`).subscribe(res => {
      const removedIds = JSON.parse(res.payload.toString()).data.removedIds as string[];
      ctx.patchState({
        notifications: ctx.getState().notifications.filter(notification => !removedIds.includes(notification._id.toString()))
      });
    });
  }

  @Action(NotificationActions.LoadAll)
  loadAll(ctx: StateContext<NotificationStateModel>) {
    return this.notificationHttpService.loadAll().pipe(
      tap(notifications => ctx.patchState({ notifications }))
    );
  }

  @Action(NotificationActions.Remove)
  remove(ctx: StateContext<NotificationStateModel>, action: NotificationActions.Remove) {
    return this.notificationHttpService.remove(action.id).pipe(
      tap(_ => ctx.setState(patch({ notifications: removeItem<NotificationModel>(item => item._id.toString() === action.id) })))
    );
  }

  @Action(NotificationActions.RemoveAll)
  removeAll(ctx: StateContext<NotificationStateModel>) {
    return this.notificationHttpService.removeAll().pipe(
      tap(_ => ctx.setState({ notifications: [] }))
    );
  }

}
