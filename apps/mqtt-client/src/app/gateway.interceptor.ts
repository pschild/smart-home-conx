import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class GatewayInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const gatewayUrl = `${window.location.protocol}//${window.location.hostname}:3333`;
    if (!request.url.startsWith('http')) {
      return next.handle(request.clone({ ...request, url: `${gatewayUrl}/${request.url}` }));
    }
    return next.handle(request);
  }
}
