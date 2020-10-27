import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from './http.service';
import { IMqttMessage } from 'ngx-mqtt';
import { EventMqttService } from './event-mqtt.service';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'smart-home-conx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  speachText = new FormControl('');

  constructor(
    private httpService: HttpService,
    private eventMqttService: EventMqttService
  ) {
  }

  ngOnInit(): void {
    // this.httpService.get();

    this.subscription = this.eventMqttService.observe('devices/+/version')
      .subscribe((data: IMqttMessage) => {
        console.log(data.payload.toString());
      });
  }

  sendMessage(): void {
    this.eventMqttService.publish('ESP_7888034/movement', 'foo').subscribe();
  }

  speak(): void {
    this.httpService.get(this.speachText.value);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
