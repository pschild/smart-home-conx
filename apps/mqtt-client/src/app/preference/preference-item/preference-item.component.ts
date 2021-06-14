import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PreferenceItem } from '../state/preference.state';

@Component({
  selector: 'smart-home-conx-preference-item',
  templateUrl: 'preference-item.component.html'
})
export class PreferenceItemComponent implements OnInit {

  @Input() preference: PreferenceItem;

  @Output() update = new EventEmitter();

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      [this.preference.key]: this.preference.value
    }, { updateOn: this.isBoolean(this.preference.value) ? 'change' : 'blur' });

    this.form.valueChanges.subscribe(value => this.update.emit(value));
  }

  isBoolean(value: any): boolean {
    return typeof value === 'boolean';
  }

}