import { Directive, HostBinding, Inject, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { BaseSensorComponent } from './base-sensor.component';
import { BASE_SENSOR_TOKEN } from './base-sensor.token';

@Directive({
  selector: '[smartHomeConxSensor]'
})
export class SensorDirective implements OnInit, OnChanges {

  @Input() cdkDragDisabled: boolean;

  @HostBinding('style.top.px')
  top;

  @HostBinding('style.left.px')
  left;

  @HostBinding('style.cursor')
  cursor;

  constructor(
    @Optional() @Inject(BASE_SENSOR_TOKEN) private hostComponent: BaseSensorComponent,
  ) {
  }

  ngOnInit(): void {
    this.top = this.hostComponent?.sensor?.position?.y;
    this.left = this.hostComponent?.sensor?.position?.x;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cdkDragDisabled) {
      this.cursor = changes.cdkDragDisabled?.currentValue ? 'pointer' : 'move';
    }
  }

}
