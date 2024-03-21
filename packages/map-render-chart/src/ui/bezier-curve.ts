import type {BezierCurveOptions} from "../typing/BezierCurve";
import type Transform from '../geo/transform';
import Group from "zrender/lib/graphic/Group";
import BezierCurve from "zrender/lib/graphic/shape/BezierCurve";
import ZRImage from 'zrender/lib/graphic/Image'
import {ZRenderType} from "zrender";
import {Point} from "../typing/BezierCurve";

class BezierCurveLine {
  private readonly start: [number, number];
  private readonly end: [number, number];
  private transform: Transform;
  private scale: number;
  private group: Group;
  private readonly icon: string;
  private zr: ZRenderType;
  constructor(options: BezierCurveOptions) {
    this.start = options.start;
    this.end = options.end;
    this.icon = options.icon;
    this.group = new Group();
  }

  _render(transform: Transform, scale: number, group: Group, zr: ZRenderType) {
    this.transform = transform;
    this.scale = scale;
    this.zr = zr
    zr.add(this.group);
    const start = this.transform.calculateOffset(scale, this.start[0], this.start[1]);
    const end = this.transform.calculateOffset(scale, this.end[0], this.end[1]);
    this._renderLine(start, end, group);
  }

  private _renderLine(start: Point, end: Point, group: Group) {
    // console.log(start)
    // console.log(end)
    // console.log((start.x + end.x) / 2)
    const curve = new BezierCurve({
      x: 0,
      y: 0,
      shape: {
        x1: start.x,
        y1: start.y,
        cpx1: (start.x + end.x) / 2,
        cpy1: (start.y + end.y) / 2 - Math.abs(start.y - end.y) - 20,
        x2: end.x,
        y2: end.y
      },
      draggable: false,
      zlevel: 110,
      style: {
        stroke: '#fff',
        lineWidth: 1.5
      }
    })
    group.add(curve);
    const icon = this._renderArrow(start, curve)
    this.group.add(icon)
    this.animateArrow(curve, icon)
  }
  // 创建动画箭头
  _renderArrow(point: Point, curve: BezierCurve) {
    const icon = new ZRImage({
      style: {
        image: this.icon,
        x: point.x,
        y: point.y - 10,
        width: 20,
        height: 20
      },
      zlevel: 110,
      // 动画
    })
    // 添加动画
    icon.animateTo(curve)
    return icon
  }

  animateArrow(curve: BezierCurve, arrowImage: ZRImage) {
  }

}

export default BezierCurveLine;