import { RoomModel } from '@smart-home-conx/api/shared/data-access/models';
import { fabric } from 'fabric-with-gestures';

const defaultRoomOptions = {
  lockRotation: true,
  cornerSize: 6,
  cornerColor: '#000',
  cornerStyle: 'circle'
};

export const Room = fabric.util.createClass(fabric.Rect, {
  type: 'room',
  text: null,
  _prevObjectStacking: null,
  _roomId: null,
  _sensorsOfRoom: [],

  initialize(rectOptions, textOptions, room: RoomModel) {
    this.callSuper('initialize', {
      ...defaultRoomOptions,
      ...rectOptions,
      data: { room }
    });
    this.setControlsVisibility({
      ml: false,
      tl: false,
      bl: false,
      tr: false,
      mt: false,
      mtr: false
    });

    this._roomId = room._id.toString();

    this.text = this.createText(room, textOptions);
    this.recalcTextPosition();

    this.addEventListener();
  },

  createText(room: RoomModel, textOptions): fabric.Text {
    return new fabric.Text(room.name, {
      ...textOptions,
      fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
      fontSize: 14,
      selectable: false
    });
  },

  addEventListener() {
    this.on('moving', () => {
      this.recalcTextPosition();

      // TODO: performance improvement possible
      const sensorsOfRoom = this.canvas._objects.filter(o => o.type === 'sensor' && o.data?.sensor?.roomId === this._roomId);
      sensorsOfRoom.forEach(s => this.recalcSensorPosition(s));
    });

    this.on('added', () => this.canvas.add(this.text));

    this.on('removed', () => this.canvas.remove(this.text));

    this.on('mousedown:before', () => {
      this._prevObjectStacking = this.canvas.preserveObjectStacking;
      this.canvas.preserveObjectStacking = true;
    });

    this.on('deselected', () => {
      this.canvas.preserveObjectStacking = this._prevObjectStacking;
    });
  },

  recalcTextPosition() {
    const leftTop = this.getPointByOrigin('left', 'top');
    this.text.set('left', leftTop.x + 20);
    this.text.set('top', leftTop.y + 20);
    this.text.setCoords();
  },

  recalcSensorPosition(sensorObj): void {
    const leftTop = this.getPointByOrigin('left', 'top');
    sensorObj.set('left', leftTop.x + (sensorObj.data?.sensor.position.x || 0));
    sensorObj.set('top', leftTop.y + (sensorObj.data?.sensor.position.y || 0));
    sensorObj.setCoords();
  }
});
