import {MarkerEventType, MarkerOptions} from "../typing";
import type Transformer from "../geo/transform";
import Circle from 'zrender/lib/graphic/shape/Circle';
import {ElementEvent, PathStyleProps} from "zrender";
import Group from "zrender/lib/graphic/Group";
import Icon from "./icon";
import {throwError} from "../util/util";
import Path from "zrender/lib/graphic/Path";

class Marker {
  private readonly _center: [number, number]
  private readonly _type: 'pixel' | 'geo' = 'geo'
  private transform: Transformer;
  private _coords: { x: number; y: number }
  private _scale: number;
  private group: Group;
  private readonly icon: Icon | undefined = undefined
  private _event: Map<keyof typeof MarkerEventType, (event: ElementEvent) => void> = new Map()
  private readonly _style: PathStyleProps | undefined
  private _size: { width: number, height: number } = {width: 30, height: 30}

  constructor(options: MarkerOptions) {
    this._center = options.center
    this._type = options.geoType || 'geo'
    this.icon = options.icon
    this._coords = {
      x: 0,
      y: 0
    }
    this._style = options.style
    if (options.size) {
      this._size = {
        width: options.size.getWidth,
        height: options.size.getHeight
      }
    }
  }

  _drawMarker(x: number, y: number) {
    const Pin = Path.extend({
      type: 'pin',
      shape: {
        // x, y on the cusp
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      buildPath: function (path, shape) {
        const x = shape.x;
        const y = shape.y;
        const w = shape.width / 5 * 3;
        // Height must be larger than width
        const h = Math.max(w, shape.height);
        const r = w / 2;

        // Dist on y with tangent point and circle center
        const dy = r * r / (h - r);
        const cy = y - h + r + dy;
        const angle = Math.asin(dy / r);
        // Dist on x with tangent point and circle center
        const dx = Math.cos(angle) * r;

        const tanX = Math.sin(angle);
        const tanY = Math.cos(angle);

        path.arc(
          x, cy, r,
          Math.PI - angle,
          Math.PI * 2 + angle
        );

        const cpLen = r * 0.6;
        const cpLen2 = r * 0.7;
        path.bezierCurveTo(
          x + dx - tanX * cpLen, cy + dy + tanY * cpLen,
          x, y - cpLen2,
          x, y
        );
        path.bezierCurveTo(
          x, y - cpLen2,
          x - dx + tanX * cpLen, cy + dy + tanY * cpLen,
          x - dx, cy + dy
        );
        path.closePath();
      }
    });

    return new Pin({
      shape: {
        x: this._coords.x,
        y: this._coords.y,
        width: this._size.width,
        height: this._size.height
      },
      zlevel: 110,
      style: this._style || {
        fill: 'rgba(255, 0, 0, 0.8)',
      }
    })
  }

  _createMarker(transform: Transformer, scale: number, group: Group): void {
    this.transform = transform
    this._scale = scale
    this.group = group
    if (this.icon) {
      const {x, y} = this.transform.calculateOffset(this._scale, this._center[0], this._center[1])
      const icon = this.icon._createIcon(x, y)
      for (const key in MarkerEventType) {
        icon.on(key, (e: ElementEvent) => {
          const cb = this._event.get(key as keyof typeof MarkerEventType)
          if (cb) {
            cb(e)
          }
        })
      }
      this.group.add(icon)
    } else {
      this._calculateOffset()
    }
  }

  update() {
    if (this.icon) {
      const {x, y} = this.transform.calculateOffset(this._scale, this._center[0], this._center[1])
      const icon = this.icon._createIcon(x, y)
      this.group?.add(icon)
    } else {
      this._calculateOffset()
      const marker = this._drawMarker(this._coords.x, this._coords.y)
      marker.type = 'marker'
      this.group?.add(marker)
    }
  }

  /**
   * 计算 Marker 的位置
   * */
  _calculateOffset() {
    if (this._type === 'geo') {
      const {x, y} = this.transform.calculateOffset(this._scale, this._center[0], this._center[1])
      this._coords = {
        x,
        y
      }
    } else {
      const {lng, lat} = this.transform.reverseCalculateOffset(this._scale, this._center[0], this._center[1])
      const {x, y} = this.transform.calculateOffset(this._scale, lng, lat)
      this._coords = {
        x,
        y
      }
    }
    let marker = this._drawMarker(this._coords.x, this._coords.y)
    marker.type = 'marker'
    for (const key in MarkerEventType) {
      marker.on(key, (e: ElementEvent) => {
        const cb = this._event.get(key as keyof typeof MarkerEventType)
        if (cb) {
          cb(e)
        }
      })
    }
    this.group?.add(marker)
  }

  on(key: keyof typeof MarkerEventType, callback: (e: ElementEvent) => void) {
    if (callback === undefined) {
      throwError('listener must be a function')
    }
    if (callback && typeof callback !== 'function') {
      throwError('listener must be a function')
    }

    this._event.set(key, callback)
    // callback()
  }
}

export default Marker