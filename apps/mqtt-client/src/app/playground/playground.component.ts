import { Component, OnInit } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { FormControl } from '@angular/forms';
import { HttpService } from '../http.service';
import { EventMqttService } from '../event-mqtt.service';

@Component({
  selector: 'smart-home-conx-playground',
  templateUrl: './playground.component.html',
})
export class PlaygroundComponent implements OnInit {

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
