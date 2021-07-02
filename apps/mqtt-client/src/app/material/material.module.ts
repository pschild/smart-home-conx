import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';

const materialModules = [
  MatButtonModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatToolbarModule,
  MatCheckboxModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatDialogModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTabsModule,
  MatSlideToggleModule,
  MatMenuModule
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
export class MaterialModule {}