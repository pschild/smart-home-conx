import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DeviceState } from '../state/device.state';
import { Select, Store } from '@ngxs/store';
import { DeviceCreateComponent } from '../device-create/device-create.component';
import { ConnectionStatus, DeviceModel } from '@smart-home-conx/api/shared/data-access/models';
import { AlexaDetailsComponent } from '../alexa-details/alexa-details.component';
import { DeviceActions } from '../state/device.actions';

@Component({
  selector: 'smart-home-conx-device-list',
  templateUrl: 'device-list.component.html'
})
export class DeviceListComponent {

  @Select(DeviceState.espList)
  espList$: Observable<DeviceModel[]>;

  @Select(DeviceState.alexaList)
  alexaDevices$: Observable<{ accountName: string }[]>;

  ConnectionStatus = ConnectionStatus;

  constructor(
    public dialog: MatDialog,
    private store: Store
  ) {
  }

  createDevice(): void {
    this.showEspDialog();
  }

  editDevice(esp: DeviceModel): void {
    this.showEspDialog(esp);
  }

  startOtaUpdate(chipId?: number): void {
    this.store.dispatch(new DeviceActions.StartOtaUpdate(chipId));
  }

  showAlexaDetails(device: { accountName: string }): void {
    this.dialog.open(AlexaDetailsComponent, { data: device });
  }

  private showEspDialog(esp?: DeviceModel): void {
    const dialogRef = this.dialog.open(DeviceCreateComponent, { data: esp ? { esp } : null });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

}