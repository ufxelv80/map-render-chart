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
  private readonly icon: string;
  private zr: ZRenderType;
  private t = 0;
  private speed = 0.01;
  constructor(options: BezierCurveOptions) {
    this.start = options.start;
    this.end = options.end;
    this.icon = options.icon;
  }

  _render(transform: Transform, scale: number, group: Group, zr: ZRenderType) {
    this.transform = transform;
    this.scale = scale;
    this.zr = zr
    const start = this.transform.calculateOffset(scale, this.start[0], this.start[1]);
    const end = this.transform.calculateOffset(scale, this.end[0], this.end[1]);
    this._renderLine(start, end, group);
  }

  private _renderLine(start: Point, end: Point, group: Group) {
    const curve = new BezierCurve({
      x: 0,
      y: 0,
      shape: {
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        cpx1: (start.x + end.x) / 2,
        cpy1: (start.y + end.y) / 2 - Math.abs(start.y - end.y) - 20,
      },
      draggable: false,
      zlevel: 110,
      style: {
        stroke: '#fff',
        lineWidth: 1.5
      }
    })
    group.add(curve);
    const icon = this._renderArrow(start);
    group.add(icon);
    this.animateArrow(curve, icon, [start.x, start.y], [end.x, end.y]);
  }
  // 创建动画箭头
  _renderArrow(point: Point) {

    const image = new ZRImage({
      style: {
        image: this.icon,
        x: point.x - 5,
        y: point.y - 5,
        width: 15,
        height: 15
      },
      zlevel: 999,
      rotation: 0
    })
    return image
  }

  animateArrow(curve: BezierCurve, arrowImage: ZRImage, p0: number[], p1: number[]) {
    let t = 0; // 参数 t 表示从 0 到 1 之间的值，表示箭头在曲线上的位置

    arrowImage.animate('style', true)
      .when(2000, {
        x: p1[0],
        y: p1[1]
      })
      .during( () => {
        t += 0.005
        if (t > 1) t = 0

        // 计算二次贝塞尔曲线上的点
        const [x, y] = this.getPointAt(t, p0, p1, curve)
        const [dx, dy] = this.getTangentAt(t, p0, p1, curve);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        // 更新箭头的位置和旋转角度
        arrowImage.attr({
          style: {
            x: x - 5,
            y: y - 5
          }
        });
      })
      .start();
  }

  getPointAt(t: number, p0: number[], p1: number[], curve: BezierCurve) {
    const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * curve.shape.cpx1 + t * t * p1[0];
    const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * curve.shape.cpy1 + t * t * p1[1];
    return [x, y];
  }

  getTangentAt(t: number, p0: number[], p1: number[], curve: BezierCurve) {
    const dx = 2 * (1 - t) * (curve.shape.cpx1 - p0[0]) + 2 * t * (p1[0] - curve.shape.cpx1);
    const dy = 2 * (1 - t) * (curve.shape.cpy1 - p0[1]) + 2 * t * (p1[1] - curve.shape.cpy1);
    return [dx, dy];
  }

}

export default BezierCurveLine;
