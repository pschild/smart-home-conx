import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('intercepted');
    request = request.clone({
      setHeaders: {
        Authorization: `Basic ${btoa(`${environment.env.SERVICE_USER}:${environment.env.SERVICE_PASSWORD}`)}`
      }
    });
    return next.handle(request);
  }
}
