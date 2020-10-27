import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MqttModule } from 'ngx-mqtt';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    MqttModule.forRoot({
      hostname: environment.env.PUBLIC_ENDPOINT.replace('http://', ''),
      port: 3333,
      path: '',
      protocol: 'ws',
      clientId: 'mqtt-client',
      // username: '',
      // password: ''
    })
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
