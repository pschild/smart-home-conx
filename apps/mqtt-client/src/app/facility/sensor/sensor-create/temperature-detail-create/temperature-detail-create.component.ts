import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TemperatureSensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'smart-home-conx-temperature-detail-create',
  templateUrl: 'temperature-detail-create.component.html',
  styleUrls: ['temperature-detail-create.component.scss'],
  providers: subformComponentProviders(TemperatureDetailCreateComponent),
})
export class TemperatureDetailCreateComponent extends NgxSubFormComponent<TemperatureSensorDetailModel> implements OnInit, OnDestroy {

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

  protected getFormControls(): Controls<TemperatureSensorDetailModel> {
    return {
      aberrance: new FormControl(null),
      warningEnabled: new FormControl(null),
      warningCriteria: new FormControl(null),
      warningLimit: new FormControl(null),
    };
  }

  protected transformToFormGroup(obj: TemperatureSensorDetailModel, defaultValues: Partial<TemperatureSensorDetailModel>): TemperatureSensorDetailModel {
    if (!obj) {
      return null;
    }
    return {
      aberrance: obj.aberrance || null,
      warningEnabled: obj.warningEnabled || null,
      warningCriteria: obj.warningCriteria || null,
      warningLimit: obj.warningLimit || null,
    };
  }

  protected getDefaultValues(): Partial<TemperatureSensorDetailModel> | null {
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
