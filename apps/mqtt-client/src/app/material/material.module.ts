import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { DomSanitizer } from '@angular/platform-browser';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatToolbarModule,
  MatCheckboxModule,
  MatRadioModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatDialogModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTabsModule,
  MatSlideToggleModule,
  MatMenuModule,
  MatTooltipModule,
  MatExpansionModule,
  MatBadgeModule
];

const cdkModules = [
  DragDropModule
];

@NgModule({
  imports: [...materialModules, ...cdkModules],
  exports: [...materialModules, ...cdkModules],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ]
})
export class MaterialModule {
  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    const BASE_URL = `${window.location.protocol}//${window.location.host}`;
    
    /**
     * https://thenounproject.com/icon/rain-probability-4351531/
     * https://www.svgrepo.com/vectors/temperature/
     */
    iconRegistry.addSvgIcon('temperature', sanitizer.bypassSecurityTrustResourceUrl(`${BASE_URL}/assets/icons/temperature.svg`));
    iconRegistry.addSvgIcon('humidity', sanitizer.bypassSecurityTrustResourceUrl(`${BASE_URL}/assets/icons/humidity.svg`));
    iconRegistry.addSvgIcon('precipitation_probability', sanitizer.bypassSecurityTrustResourceUrl(`${BASE_URL}/assets/icons/umbrella.svg`));
  }
}