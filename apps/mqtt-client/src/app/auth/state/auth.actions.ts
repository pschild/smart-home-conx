export namespace AuthActions {

  export class Login {
    static readonly type = '[Auth] login';

    constructor(public username: string, public password: string) {}
  }

  export class Logout {
    static readonly type = '[Auth] logout';
  }

}
