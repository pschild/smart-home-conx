import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MqttModule } from 'ngx-mqtt';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    MqttModule.forRoot({
      hostname: 'localhost',
      port: 1884,
      path: '',
      protocol: 'ws'
    })
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
