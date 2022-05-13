import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Store } from '@ngxs/store';
import { RoomModel, SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { fabric } from 'fabric-with-gestures';
import { filter, fromEvent, merge, Observable, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { TimeAgoUtil } from '../../../core/time-ago.util';
import { EventMqttService } from '../../../event-mqtt.service';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';
import { Room } from './room.fabric-object';
import { Sensor } from './sensor.fabric-object';

@Component({
  selector: 'smart-home-conx-canvas',
  templateUrl: './canvas.component.html'
})
export class CanvasComponent implements OnInit, OnDestroy {

  @ViewChild(MatMenuTrigger) private menuTrigger: MatMenuTrigger;

  canvas: fabric.Canvas;

  private gridSize = 50;

  // mouse events
  private isDragging = false;
  private lastPosX = null;
  private lastPosY = null;

  // touch events
  private pausePanning = false;
  private zoomStartScale: number;
  private lastX: number;
  private lastY: number;

  rooms$: Observable<RoomModel[]>;
  sensors$: Observable<SensorModel[]>;

  chosenSensor$ = new Subject<SensorModel>();

  destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private eventMqttService: EventMqttService,
  ) {
  }

  ngOnInit(): void {
    this.rooms$ = this.store.select(SensorState.rooms);
    this.sensors$ = this.store.select(SensorState.sensors);

    this.initCanvas();
    // this.renderGrid();

    this.rooms$.pipe(
      tap(() => console.log('rooms TICK')),
      tap(() => this.canvas.remove(...this.canvas.getObjects('room'))),
      takeUntil(this.destroy$)
    ).subscribe(rooms => rooms.map(room => this.renderRoom(room)));

    this.sensors$.pipe(
      tap(() => console.log('sensors TICK')),
      tap(() => this.canvas.remove(...this.canvas.getObjects('sensor'))),
      takeUntil(this.destroy$)
    ).subscribe(sensors => sensors.map(sensor => this.renderSensor(sensor)));
  }

  private initCanvas(): void {
    this.canvas = new fabric.Canvas('floor', {
      backgroundColor: '#ccc',
      selection: false,
      renderOnAddRemove: false,
      stateful: false,
      fireMiddleClick: true
    });

    this.canvas.setHeight(1000);
    this.canvas.setWidth(1000);

    this.canvas.on('object:moving', (options) => {
      options.target.set({
        left: Math.round(options.target.left / this.gridSize) * this.gridSize,
        top: Math.round(options.target.top / this.gridSize) * this.gridSize,
      });
    });

    this.canvas.on('object:scaling', (options) => {
      const target = options.target,
        w = target.width * target.scaleX,
        h = target.height * target.scaleY,
        snap = {
          // Closest snapping points
          top: Math.round(target.top / this.gridSize) * this.gridSize,
          left: Math.round(target.left / this.gridSize) * this.gridSize,
          bottom: Math.round((target.top + h) / this.gridSize) * this.gridSize,
          right: Math.round((target.left + w) / this.gridSize) * this.gridSize,
        },
        threshold = this.gridSize,
        dist = {
          // Distance from snapping points
          top: Math.abs(snap.top - target.top),
          left: Math.abs(snap.left - target.left),
          bottom: Math.abs(snap.bottom - target.top - h),
          right: Math.abs(snap.right - target.left - w),
        },
        attrs = {
          scaleX: target.scaleX,
          scaleY: target.scaleY,
          top: target.top,
          left: target.left,
        };
      switch (target['__corner']) {
        case 'tl':
          if (dist.left < dist.top && dist.left < threshold) {
            attrs.scaleX = (w - (snap.left - target.left)) / target.width;
            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
            attrs.top = target.top + (h - target.height * attrs.scaleY);
            attrs.left = snap.left;
          } else if (dist.top < threshold) {
            attrs.scaleY = (h - (snap.top - target.top)) / target.height;
            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
            attrs.left = attrs.left + (w - target.width * attrs.scaleX);
            attrs.top = snap.top;
          }
          break;
        case 'mt':
          if (dist.top < threshold) {
            attrs.scaleY = (h - (snap.top - target.top)) / target.height;
            attrs.top = snap.top;
          }
          break;
        case 'tr':
          if (dist.right < dist.top && dist.right < threshold) {
            attrs.scaleX = (snap.right - target.left) / target.width;
            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
            attrs.top = target.top + (h - target.height * attrs.scaleY);
          } else if (dist.top < threshold) {
            attrs.scaleY = (h - (snap.top - target.top)) / target.height;
            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
            attrs.top = snap.top;
          }
          break;
        case 'ml':
          if (dist.left < threshold) {
            attrs.scaleX = (w - (snap.left - target.left)) / target.width;
            attrs.left = snap.left;
          }
          break;
        case 'mr':
          if (dist.right < threshold)
            attrs.scaleX = (snap.right - target.left) / target.width;
          break;
        case 'bl':
          if (dist.left < dist.bottom && dist.left < threshold) {
            attrs.scaleX = (w - (snap.left - target.left)) / target.width;
            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
            attrs.left = snap.left;
          } else if (dist.bottom < threshold) {
            attrs.scaleY = (snap.bottom - target.top) / target.height;
            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
            attrs.left = attrs.left + (w - target.width * attrs.scaleX);
          }
          break;
        case 'mb':
          if (dist.bottom < threshold)
            attrs.scaleY = (snap.bottom - target.top) / target.height;
          break;
        case 'br':
          if (dist.right < dist.bottom && dist.right < threshold) {
            attrs.scaleX = (snap.right - target.left) / target.width;
            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
          } else if (dist.bottom < threshold) {
            attrs.scaleY = (snap.bottom - target.top) / target.height;
            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
          }
          break;
      }
      target.set(attrs);
    });

    if (this.isTouchDevice()) {
      this.addTouchEvents();
    } else {
      this.addMouseEvents();
    }
  }

  private addMouseEvents(): void {
    this.canvas.on('mouse:wheel', opt => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      this.canvas.requestRenderAll();
    });

    this.canvas.on('mouse:down', opt => {
      opt.e.preventDefault();
      const evt = opt.e;
      if (opt.button === 2) {
        this.isDragging = true;
        this.canvas.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:move', opt => {
      if (this.isDragging) {
        const e = opt.e;
        const vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.canvas.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });

    this.canvas.on('mouse:up', () => {
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.isDragging = false;
      this.canvas.selection = true;
    });
  }

  private addTouchEvents(): void {
    this.canvas.on('touch:gesture', e => {
      if (e.e.touches && e.e.touches.length == 2) {
        this.pausePanning = true;
        const point = new fabric.Point(e.self.x, e.self.y);
        if (e.self.state == "start") {
          this.zoomStartScale = this.canvas.getZoom();
        }
        const delta = this.zoomStartScale * e.self.scale;
        this.canvas.zoomToPoint(point, delta);
        this.pausePanning = false;
      }
    });

    this.canvas.on('selection:created', e => {
      this.pausePanning = true;
    });

    this.canvas.on('selection:cleared', e => {
      this.pausePanning = false;
    });

    this.canvas.on('touch:drag', e => {
      if (!this.pausePanning && !!e.self.x && !!e.self.y) {
        const currentX = e.self.x;
        const currentY = e.self.y;
        const xChange = currentX - this.lastX;
        const yChange = currentY - this.lastY;

        if ((Math.abs(currentX - this.lastX) <= 50) && (Math.abs(currentY - this.lastY) <= 50)) {
          const delta = new fabric.Point(xChange, yChange);
          this.canvas.relativePan(delta);
        }

        this.lastX = e.self.x
        this.lastY = e.self.y;
      }
    });
  }

  private renderGrid(): void {
    for (let i = 0; i < 1000 / this.gridSize; i++) {
      this.canvas.add(
        new fabric.Line([i * this.gridSize, 0, i * this.gridSize, 1000], {
          stroke: '#bbb',
          selectable: false,
        })
      );
      this.canvas.add(
        new fabric.Line([0, i * this.gridSize, 1000, i * this.gridSize], {
          stroke: '#bbb',
          selectable: false,
        })
      );
    }
  }

  private renderSensor(sensor: SensorModel): void {
    const roomOfSensor = this.store.selectSnapshot(SensorState.roomOfSensor(sensor));
    const sensorObj = new Sensor(sensor, roomOfSensor ? roomOfSensor.position : { x: 0, y: 0 });

    sensorObj.on('sensor:contextmenu', ({ position }) => {
      const menu = document.getElementById('menuBtn');
      menu.style.left = position.x + 'px';
      menu.style.top = position.y + 'px';
      this.menuTrigger.openMenu();

      this.chosenSensor$.next(sensor);
    });

    sensorObj.on('sensor:dropped', ({ targetRoom, sensor, sensorObj }) => {
      if (!targetRoom) {
        this.store.dispatch(new SensorActions.UpdateSensor(sensor._id.toString(), { roomId: null }));
      } else {
        this.store.dispatch(new SensorActions.UpdateSensor(sensor._id.toString(), {
          roomId: targetRoom.data.room._id.toString(),
          position: { x: sensorObj.left - targetRoom.left, y: sensorObj.top - targetRoom.top }
        }));
      }
    });

    this.store.select(SensorState.latest(sensor._id.toString(), sensor.type)).pipe(
      filter(latest => !!latest && !!latest.value),
      tap(latest => sensorObj.setValue(latest.value.toFixed(1))),
      switchMap(latest => timer(0, 1000).pipe(
        tap(() => sensorObj.setTime(TimeAgoUtil.createLabel(latest.time, 'vor')))
      )),
      takeUntil(merge(this.destroy$, fromEvent(sensorObj, 'sensor:removed')))
    ).subscribe(() => this.canvas.requestRenderAll());

    this.canvas.add(sensorObj);
    this.canvas.bringToFront(sensorObj);
    this.canvas.renderAll();
  }

  private renderRoom(room: RoomModel): void {
    const rectOptions = {
      name: `room-${room._id}`,
      top: room.position.y,
      left: room.position.x,
      width: room.width,
      height: room.height,
      fill: 'lightblue',
    }
    const textOptions = {
      name: `roomlabel-${room._id}`,
    }
    const roomObj = new Room(rectOptions, textOptions, room);

    roomObj.on('moved', e => {
      this.store.dispatch(new SensorActions.UpdateRoom(room._id.toString(), {
        position: { x: e.target.get('left'), y: e.target.get('top') }
      }));
    });

    roomObj.on('scaled', e => {
      this.store.dispatch(new SensorActions.UpdateRoom(room._id.toString(), {
        width: e.target.getScaledWidth(),
        height: e.target.getScaledHeight()
      }));
    });

    this.canvas.add(roomObj);
    this.canvas.sendToBack(roomObj);
    this.canvas.requestRenderAll();
  }

  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendFakeTemp(): void {
    const value = Math.floor(Math.random() * 30) + 15;
    this.eventMqttService.publish('devices/7888034/temperature', `{"value":${value}}`).subscribe();
  }

  sendFakeVolt(): void {
    const value = Math.floor(Math.random() * 2) + 3.5;
    this.eventMqttService.publish('devices/7888034/voltage', `{"value":${value}}`).subscribe();
  }

}
