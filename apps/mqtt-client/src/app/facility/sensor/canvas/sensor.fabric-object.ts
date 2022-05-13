import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { fabric } from 'fabric-with-gestures';
import { SensorUtil } from '../sensor.util';

const defaultTextOptions = {
  fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
  fontSize: 12,
  selectable: false,
  originX: 'center',
  originY: 'center'
};

export const Sensor = fabric.util.createClass(fabric.Group, {
  type: 'sensor',
  valueText: null,
  timeText: null,
  suffix: '',

  _dragged: false,

  initialize(sensor: SensorModel, roomTopLeft: { x: number; y: number; }) {
    const icon = new fabric.IText(SensorUtil.getIconCodeByType(sensor.type), {
      ...defaultTextOptions,
      fontFamily: 'Material Icons',
      fontSize: 24
    });

    const valueText = new fabric.Text('-', {
      ...defaultTextOptions,
      top: 20
    });
    this.valueText = valueText;

    const timeText = new fabric.Text('-', {
      ...defaultTextOptions,
      top: 34
    });
    this.timeText = timeText;

    this.suffix = SensorUtil.getSuffixByType(sensor.type);

    this.callSuper('initialize', [icon, valueText, timeText], {
      data: { sensor },
      top: sensor.position.y + roomTopLeft.y,
      left: sensor.position.x + roomTopLeft.x,
      hasControls: false,
      hasBorders: false
    });

    this.on('removed', () => this.fire('sensor:removed'));

    this.on('moved', e => {
      const sensorObj = e.target;
      const rooms = this.canvas.getObjects('room');
      const targetRoom = rooms.find(r => {
        return sensorObj.top + sensorObj.height / 2 >= r.top
          && sensorObj.top + sensorObj.height / 2 <= r.top + r.height
          && sensorObj.left + sensorObj.width / 2 >= r.left
          && sensorObj.left + sensorObj.width / 2 <= r.left + r.width
      });
      this.fire('sensor:dropped', { targetRoom, sensor, sensorObj });
    });

    this.on('mousedown', e => {
      this._dragged = false;
    });

    this.on('mousemove', e => {
      this._dragged = true;
    });

    this.on('mouseup', e => {
      if (e.button === 1 && !this._dragged) {
        this.fire('sensor:contextmenu', { position: { x: e.e.pageX, y: e.e.pageY } });
      }
    });
  }
});

Sensor.prototype.setValue = function(value: string) { this.valueText.set({ text: `${value}${this.suffix}` }); }
Sensor.prototype.setTime = function(time: string) { this.timeText.set({ text: time }); }
