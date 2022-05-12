import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { VoltageSensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'smart-home-conx-voltage-detail-create',
  templateUrl: 'voltage-detail-create.component.html',
  styleUrls: ['voltage-detail-create.component.scss'],
  providers: subformComponentProviders(VoltageDetailCreateComponent),
})
export class VoltageDetailCreateComponent extends NgxSubFormComponent<VoltageSensorDetailModel> implements OnInit, OnDestroy {

  destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.formGroupControls.warningEnabled.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(warningEnabled => {
      if (!warningEnabled) {
        this.formGroupControls.warningCriteria.reset();
        this.formGroupControls.warningLimit.reset();
      }
    });
  }

  protected getFormControls(): Controls<VoltageSensorDetailModel> {
    return {
      warningEnabled: new FormControl(null),
      warningCriteria: new FormControl(null),
      warningLimit: new FormControl(null),
    };
  }

  protected transformToFormGroup(obj: VoltageSensorDetailModel, defaultValues: Partial<VoltageSensorDetailModel>): VoltageSensorDetailModel {
    if (!obj) {
      return null;
    }
    return {
      warningEnabled: obj.warningEnabled || null,
      warningCriteria: obj.warningCriteria || null,
      warningLimit: obj.warningLimit || null,
    };
  }

  protected getDefaultValues(): Partial<VoltageSensorDetailModel> | null {
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
