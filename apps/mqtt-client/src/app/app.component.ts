import { Component, OnInit } from '@angular/core';
import { HttpService } from './http.service';
import { IMqttMessage } from 'ngx-mqtt';
import { EventMqttService } from './event-mqtt.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'smart-home-conx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  speachText = new FormControl('');

  constructor(
    private httpService: HttpService,
    private eventMqttService: EventMqttService
  ) {
  }

  ngOnInit(): void {
    this.eventMqttService.observe('devices/+/version')
      .subscribe((data: IMqttMessage) => console.log('esp ping', data.payload.toString()));

    this.eventMqttService.observe('adesso-commuter-server/commuting/#')
      .subscribe((data: IMqttMessage) => console.log('commuting', data.payload.toString()));
  }

  sendMessage(): void {
    this.eventMqttService.publish('ESP_7888034/movement', 'foo').subscribe();
  }

  speak(): void {
    this.httpService.speak(this.speachText.value).subscribe(console.log);
  }

  getCommutingHistory(): void {
    this.httpService.commutingHistory().subscribe(console.log);
  }

}
