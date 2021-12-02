import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken, Store } from '@ngxs/store';
import { insertItem, patch } from '@ngxs/store/operators';
import { addSeconds, differenceInMinutes, isAfter, isEqual, subMinutes } from 'date-fns';
import { CommutingHttpService } from './commuting-http.service';
import { CommutingStateUtil } from './commuting-state.util';
import { CommutingActions } from './commuting.actions';

export interface DurationInfo {
  minutes: number;
  distance: number;
  delay: string;
}

export interface StateEntry {
  time: Date;
  state: 'START' | 'END' | 'CANCELLED';
}

export interface CommutingEntry {
  time: Date;
  startLat: number;
  startLng: number;
  destinationLat: number;
  destinationLng: number;
  durations: DurationInfo[];
}

export const COMMUTING_STATE_NAME = new StateToken<CommutingStateModel>('commuting');

const now = new Date();

export interface CommutingStateModel {
  stateEntries: StateEntry[];
  commutingEntries: CommutingEntry[];
  averageCommutingTime: number;
}

@State<CommutingStateModel>({
  name: COMMUTING_STATE_NAME,
  defaults: {
    stateEntries: [
      // { time: subDays(now, 1), state: 'CANCELLED' },
      // { time: subMinutes(now, 100), state: 'START' },
      // { time: subMinutes(now, 55), state: 'CANCELLED' },
    ],
    commutingEntries: [
      // { time: subMinutes(now, 90), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 90, distance: 4.2, delay: 'light' }] },
      // { time: subMinutes(now, 80), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 80, distance: 4.2, delay: 'light' }] },
      // { time: subMinutes(now, 70), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 70, distance: 3.6, delay: 'light' }] },
      // { time: subMinutes(now, 60), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 70, distance: 3.1, delay: 'light' }] },
      // { time: subMinutes(now, 50), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 60, distance: 3.1, delay: 'light' }] },
      // { time: subMinutes(now, 40), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 50, distance: 3.1, delay: 'light' }] },
      // { time: subMinutes(now, 30), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 40, distance: 3.1, delay: 'light' }] },
      // { time: subMinutes(now, 20), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 25, distance: 3.1, delay: 'light' }] },
      // { time: subMinutes(now, 10), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 20, distance: 3.1, delay: 'light' }] },
      // { time: subMinutes(now, 1), startLat: 51.4, startLng: 7.01, destinationLat: 51.66, destinationLng: 6.15, durations: [{ minutes: 10, distance: 3.1, delay: 'light' }] },
    ],
    averageCommutingTime: 2 * 60
  }
})
@Injectable()
export class CommutingState implements NgxsOnInit {

  @Selector()
  static stateEntries(state: CommutingStateModel): StateEntry[] {
    return state.stateEntries.sort((a, b) => a.time.getTime() - b.time.getTime());
  }

  @Selector()
  static commutingEntries(state: CommutingStateModel) {
    return state.commutingEntries.sort((a, b) => a.time.getTime() - b.time.getTime());
  }

  @Selector([CommutingState.stateEntries])
  static latestStateEntry(state: CommutingStateModel, stateEntries: StateEntry[]): StateEntry {
    return stateEntries[stateEntries.length - 1];
  }

  @Selector([CommutingState.latestStateEntry])
  static currentCommutingState(state: CommutingStateModel, latestStateEntry: StateEntry) {
    return !!latestStateEntry ? latestStateEntry.state : null;
  }

  @Selector([CommutingState.latestStateEntry])
  static isCommuting(state: CommutingStateModel, latestStateEntry: StateEntry) {
    return !!latestStateEntry && latestStateEntry.state === 'START';
  }

  @Selector([CommutingState.latestStateEntry])
  static startedAt(state: CommutingStateModel, latestStateEntry: StateEntry) {
    return !!latestStateEntry ? new Date(latestStateEntry.time) : null;
  }

  @Selector([CommutingState.startedAt, CommutingState.secondsLeft])
  static arriveAt(state: CommutingStateModel, startedAt: Date, secondsLeft: number) {
    return !!startedAt ? addSeconds(startedAt, secondsLeft) : null;
  }

  @Selector()
  static averageCommutingTime(state: CommutingStateModel) {
    return state.averageCommutingTime;
  }

  @Selector([CommutingState.isCommuting, CommutingState.commutingEntries, CommutingState.latestStateEntry, CommutingState.stateEntries])
  static commutingEntriesSinceStart(state: CommutingStateModel, isCommuting: boolean, commutingEntries: CommutingEntry[], latestStateEntry: StateEntry, stateEntries: StateEntry[]) {
    return !!latestStateEntry && isCommuting ? commutingEntries.filter(e => isAfter(e.time, latestStateEntry.time) || isEqual(e.time, latestStateEntry.time)) : [];
    // const startEvents = stateEntries.filter(e => e.state === 'START');
    // const latestStartEvent = startEvents.length > 0 ? startEvents[startEvents.length - 1] : null;
    // return !!latestStartEvent ? commutingEntries.filter(e => isAfter(e.time, latestStartEvent.time) || isEqual(e.time, latestStartEvent.time)) : [];
  }

  @Selector([CommutingState.isCommuting, CommutingState.commutingEntriesSinceStart])
  static secondsLeft(state: CommutingStateModel, isCommuting: boolean, entries: CommutingEntry[]) {
    if (!isCommuting) {
      return 0;
    }
    return entries.length === 0 ? state.averageCommutingTime : CommutingStateUtil.getFastestDuration(entries[entries.length - 1].durations)?.minutes * 60;
  }

  @Selector([CommutingState.isCommuting, CommutingState.latestStateEntry, CommutingState.commutingEntriesSinceStart, CommutingState.averageCommutingTime])
  static currentProgress(state: CommutingStateModel, isCommuting: boolean, latestStateEntry: StateEntry, entries: CommutingEntry[], averageCommutingTime: number) {
    if (entries.length === 0) {
      return isCommuting ? 0 : null;
    } else {
      const lastEntry = entries[entries.length - 1];
      return isCommuting ? CommutingStateUtil.getProgress(entries, lastEntry, latestStateEntry, averageCommutingTime) : null;
    }
  }

  @Selector([CommutingState.latestStateEntry])
  static commutingInfosVisible(state: CommutingStateModel, latestStateEntry: StateEntry) {
    switch (latestStateEntry?.state) {
      case 'START':
        return true;
      case 'END':
      case 'CANCELLED':
        return differenceInMinutes(new Date(), new Date(latestStateEntry.time)) <= 60;
      default:
        return false;
    }
  }

  constructor(
    private store: Store,
    private commutingHttpService: CommutingHttpService
  ) {
  }

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit commuting.state');
  }

  @Action(CommutingActions.FakeStart)
  fakeStart(ctx: StateContext<CommutingStateModel>, action: CommutingActions.FakeStart) {
    ctx.setState(patch({
      stateEntries: insertItem({ time: new Date(), state: 'START' })
    }));
  }
  
  @Action(CommutingActions.FakeStop)
  fakeStop(ctx: StateContext<CommutingStateModel>, action: CommutingActions.FakeStop) {
    ctx.setState(patch({
      stateEntries: insertItem({ time: new Date(), state: 'END' })
    }));
  }
  
  @Action(CommutingActions.FakeCancel)
  fakeCancel(ctx: StateContext<CommutingStateModel>, action: CommutingActions.FakeCancel) {
    ctx.setState(patch({
      stateEntries: insertItem({ time: new Date(), state: 'CANCELLED' })
    }));
  }

  @Action(CommutingActions.FakeUpdate)
  fakeUpdate(ctx: StateContext<CommutingStateModel>, action: CommutingActions.FakeUpdate) {
    ctx.setState(patch({
      commutingEntries: insertItem({
        time: new Date(),
        startLat: 51.4,
        startLng: 7.01,
        destinationLat: 51.66,
        destinationLng: 6.15,
        durations: [{ minutes: action.minutes, distance: 3.1, delay: 'light' }]
      })
    }));
  }

}
