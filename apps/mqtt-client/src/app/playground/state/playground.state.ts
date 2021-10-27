import { Injectable } from '@angular/core';
import { NgxsOnInit, State, StateContext, StateToken } from '@ngxs/store';

export const PLAYGROUND_STATE_NAME = new StateToken<PlaygroundStateModel>('playground');

// tslint:disable-next-line:no-empty-interface
export interface PlaygroundStateModel {
}

@State<PlaygroundStateModel>({
  name: PLAYGROUND_STATE_NAME,
  defaults: {
  }
})
@Injectable()
export class PlaygroundState implements NgxsOnInit {

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit playground.state');
  }
}
