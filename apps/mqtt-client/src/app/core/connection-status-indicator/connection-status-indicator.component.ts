import { Component, Input } from '@angular/core';
import { ConnectionStatus } from '@smart-home-conx/api/shared/data-access/models';

@Component({
  selector: 'smart-home-conx-connection-status-indicator',
  templateUrl: 'connection-status-indicator.component.html',
  styleUrls: ['connection-status-indicator.component.scss']
})
export class ConnectionStatusIndicatorComponent {

  @Input()
  status: ConnectionStatus;

  ConnectionStatus = ConnectionStatus;
}