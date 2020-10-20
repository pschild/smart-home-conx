import { Injectable } from '@angular/core';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventMqttService {

  constructor(private mqttService: MqttService) {
  }

  observe(topic: string): Observable<IMqttMessage> {
    return this.mqttService.observe(topic);
  }

  publish(topic: string, message: string | Buffer): Observable<void> {
    return this.mqttService.publish(topic, message);
  }
}
