import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SwitchSensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'smart-home-conx-switch-detail-create',
  templateUrl: 'switch-detail-create.component.html',
  styleUrls: ['switch-detail-create.component.scss'],
  providers: subformComponentProviders(SwitchDetailCreateComponent),
})
export class SwitchDetailCreateComponent extends NgxSubFormComponent<SwitchSensorDetailModel> implements OnInit, OnDestroy {

  destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.formGroupControls.warningEnabled.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(warningEnabled => {
      if (!warningEnabled) {
        this.formGroupControls.warningCriteria.reset();
      }
    });
  }

  protected getFormControls(): Controls<SwitchSensorDetailModel> {
    return {
      warningEnabled: new FormControl(null),
      warningCriteria: new FormControl(null),
    };
  }

  protected transformToFormGroup(obj: SwitchSensorDetailModel, defaultValues: Partial<SwitchSensorDetailModel>): SwitchSensorDetailModel {
    if (!obj) {
      return null;
    }
    return {
      warningEnabled: obj.warningEnabled || null,
      warningCriteria: obj.warningCriteria || null,
    };
  }

  protected getDefaultValues(): Partial<SwitchSensorDetailModel> | null {
    return {
      warningEnabled: false,
    };
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

}
