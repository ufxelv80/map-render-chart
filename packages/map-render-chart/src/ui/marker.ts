import {MarkerEventKey, MarkerOptions} from "../typing/Marker";
import type Transformer from "../geo/transform";
import Circle from 'zrender/lib/graphic/shape/Circle';
import {ElementEvent} from "zrender";
import Group from "zrender/lib/graphic/Group";
import Icon from "./icon";

class Marker {
  private readonly _center: [number, number]
  private readonly _type: 'pixel' | 'geo' = 'pixel'
  private transform: Transformer;
  private _coords: { x: number; y: number }
  private _scale: number;
  private group: Group;
  private readonly icon: Icon | undefined = undefined

  constructor(options: MarkerOptions) {
    this._center = options.center
    this._type = options.geoType || 'pixel'
    this.icon = options.icon
    this._coords = {
      x: 0,
      y: 0
    }
  }

  _drawMarker(x: number, y: number): Circle {
    const circle = new Circle({
      shape: {
        cx: this._coords.x,
        cy: this._coords.y,
        r: 10
      },
      zlevel: 10,
      style: {
        fill: 'rgba(255, 0, 0, 0.8)',
      }
    })

    circle.on('click', (e: ElementEvent) => {
      console.log('marker', e)
    })
    return circle
  }

  _createMarker(transform: Transformer, scale: number, group: Group): void {
    this.transform = transform
    this._scale = scale
    this.group = group
    if (this.icon) {
      const {x, y} = this.transform.calculateOffset(this._scale, this._center[0], this._center[1])
      const icon = this.icon._createIcon(x, y)
      icon.on('click', (e: ElementEvent) => {
        console.log('marker', e)
      })
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
    this.group?.add(marker)
  }

  on(key: MarkerEventKey, callback: () => void) {
    if (callback === undefined) {
      throw new Error('listener must be a function')
    }
    if (callback && typeof callback !== 'function') {
      throw new Error('listener must be a function')
    }

    callback()
  }
}

export default Marker