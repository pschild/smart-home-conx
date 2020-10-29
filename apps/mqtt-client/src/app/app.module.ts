import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MqttModule } from 'ngx-mqtt';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    MqttModule.forRoot({
      hostname: window.location.hostname,
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
