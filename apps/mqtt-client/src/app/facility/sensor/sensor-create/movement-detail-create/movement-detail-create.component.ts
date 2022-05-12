import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MovementSensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'smart-home-conx-movement-detail-create',
  templateUrl: 'movement-detail-create.component.html',
  styleUrls: ['movement-detail-create.component.scss'],
  providers: subformComponentProviders(MovementDetailCreateComponent),
})
export class MovementDetailCreateComponent extends NgxSubFormComponent<MovementSensorDetailModel> {

  protected getFormControls(): Controls<MovementSensorDetailModel> {
    return {
      lockTime: new FormControl(null),
      warningEnabled: new FormControl(null),
    };
  }

  protected transformToFormGroup(obj: MovementSensorDetailModel, defaultValues: Partial<MovementSensorDetailModel>): MovementSensorDetailModel {
    if (!obj) {
      return null;
    }
    return {
      lockTime: obj.lockTime || null,
      warningEnabled: obj.warningEnabled || null,
    };
  }

  protected getDefaultValues(): Partial<MovementSensorDetailModel> | null {
    return {
      warningEnabled: false
    };
  }

}
