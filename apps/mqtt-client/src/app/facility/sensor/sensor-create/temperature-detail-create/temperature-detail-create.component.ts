import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TemperatureSensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'smart-home-conx-temperature-detail-create',
  templateUrl: 'temperature-detail-create.component.html',
  providers: subformComponentProviders(TemperatureDetailCreateComponent),
})
export class TemperatureDetailCreateComponent extends NgxSubFormComponent<TemperatureSensorDetailModel> {

  protected getFormControls(): Controls<TemperatureSensorDetailModel> {
    return {
      aberrance: new FormControl(null),
    };
  }

}
