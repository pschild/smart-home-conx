export namespace CommutingActions {

  export class Load {
    static readonly type = '[Commuting] load';
  }

  export class FakeStart {
    static readonly type = '[Commuting] fake start';
  }

  export class FakeStop {
    static readonly type = '[Commuting] fake stop';
  }

  export class FakeCancel {
    static readonly type = '[Commuting] fake cancel';
  }

  export class FakeUpdate {
    static readonly type = '[Commuting] fake update';

    constructor(public minutes: number) {}
  }
}
