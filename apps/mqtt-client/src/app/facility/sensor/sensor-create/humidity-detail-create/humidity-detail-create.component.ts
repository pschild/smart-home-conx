import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HumiditySensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'smart-home-conx-humidity-detail-create',
  templateUrl: 'humidity-detail-create.component.html',
  providers: subformComponentProviders(HumidityDetailCreateComponent),
})
export class HumidityDetailCreateComponent extends NgxSubFormComponent<HumiditySensorDetailModel> {

  protected getFormControls(): Controls<HumiditySensorDetailModel> {
    return {
      aberrance: new FormControl(null),
    };
  }

}
