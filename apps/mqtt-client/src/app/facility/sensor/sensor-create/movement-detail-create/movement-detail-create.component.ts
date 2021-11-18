import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MovementSensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'smart-home-conx-movement-detail-create',
  templateUrl: 'movement-detail-create.component.html',
  providers: subformComponentProviders(MovementDetailCreateComponent),
})
export class MovementDetailCreateComponent extends NgxSubFormComponent<MovementSensorDetailModel> {

  protected getFormControls(): Controls<MovementSensorDetailModel> {
    return {
      lockTime: new FormControl(null),
    };
  }

}
