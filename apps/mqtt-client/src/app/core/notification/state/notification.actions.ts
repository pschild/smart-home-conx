export class LoadAll {
  static readonly type = '[Notifications] load all';
}

export class Remove {
  static readonly type = '[Notifications] remove';
  constructor(public id: string) {}
}

export class RemoveAll {
  static readonly type = '[Notifications] remove all';
}