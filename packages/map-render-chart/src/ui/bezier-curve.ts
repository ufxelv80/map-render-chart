import type {BezierCurveOptions} from "../typing/BezierCurve";
import type Transform from '../geo/transform';
import Group from "zrender/lib/graphic/Group";
import BezierCurve from "zrender/lib/graphic/shape/BezierCurve";
import ZRImage from 'zrender/lib/graphic/Image'
import {ZRenderType} from "zrender";
import {Point} from "../typing/BezierCurve";
import Polyline from 'zrender/lib/graphic/shape/Polyline'
import { bearing, point as turfPoint } from '@turf/turf'

class BezierCurveLine {
  private readonly start: [number, number];
  private readonly end: [number, number];
  private transform: Transform;
  private scale: number;
  private readonly icon: string;
  private zr: ZRenderType;
  private t = 0;
  private speed = 0.01;
  private counter: number
  private steps: number
  constructor(options: BezierCurveOptions) {
    this.start = options.start;
    this.end = options.end;
    this.icon = options.icon;
    this.counter = 0
    this.steps = 300
  }

  _render(transform: Transform, scale: number, group: Group, zr: ZRenderType) {
    this.transform = transform;
    this.scale = scale;
    this.zr = zr
    const start = this.transform.calculateOffset(scale, this.start[0], this.start[1]);
    const end = this.transform.calculateOffset(scale, this.end[0], this.end[1]);
    // this._renderLine(start, end, group);
    this.testRenderLine(group)
  }

  testRenderLine (group: Group) {
    const lngLat = this.computedBezierCurve(this.start, this.end, this.steps)
    // console.log(points)
    const points = lngLat.map(item => [this.transform.calculateOffset(this.scale, item[0], item[1]).x, this.transform.calculateOffset(this.scale, item[0], item[1]).y])
    const polyline = new Polyline({
      shape: {
        points: points
      },
      style: {
        lineWidth: 1,
        stroke: '#fff'
      },
      zlevel: 100
    });
    group.add(polyline)
    const image = this._renderArrow(lngLat)
    group.add(image)
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
  _renderArrow(points: number[][]) {
    const point = this.transform.calculateOffset(this.scale, points[0][0], points[0][1])
    const image = new ZRImage({
      style: {
        image: this.icon,
        x: point.x - 5,
        y: point.y - 5,
        width: 15,
        height: 15,
      },
      zlevel: 999,
      // rotation: 50,
      // originY: point.y + 15 / 2,
      // originX: point.x + 15 / 2
    })
    this.animate(image, points)
    console.log(image)
    image.dirty();
    return image
  }

  animate (icon: ZRImage, coordinates: number[][]) {
    let lastCounter = 0;
    const startAnimate = () => {
      const start = coordinates[this.counter >= this.steps ? this.counter - 1 : this.counter];
      const end = coordinates[this.counter >= this.steps ? this.counter : this.counter + 1];
      if (!start || !end) return;
      const currentPoint = coordinates[this.counter];
      const point = this.transform.calculateOffset(this.scale, currentPoint[0], currentPoint[1])
      icon.attr({
        style: {
          x: point.x - 5,
          y: point.y - 5
        }
      });

      if (this.counter !== lastCounter) {
        // 计算新的旋转角度
        const iconBearing = bearing(turfPoint(start), turfPoint(end));

        // 更新旋转角度和旋转中心
        icon.attr({
          rotation: -iconBearing,
          originX: point.x,
          originY: point.y
        });

        // 更新上一次计数器
        lastCounter = this.counter;
      }

      if (this.counter < this.steps) {
        requestAnimationFrame(startAnimate)
      } else {
        this.counter = 0
        requestAnimationFrame(startAnimate)
      }

      this.counter = this.counter + 1;
    }
    startAnimate()
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

  // 生成贝塞尔曲线点
  bezierCurve (p0: number[], p1: number[], p2: number[], t: number): number[] {
    const x = Math.pow(1 - t, 2) * p0[0] + 2 * (1 - t) * t * p1[0] + Math.pow(t, 2) * p2[0]
    const y = Math.pow(1 - t, 2) * p0[1] + 2 * (1 - t) * t * p1[1] + Math.pow(t, 2) * p2[1]

    return [x, y]
  }

  computedBezierCurve (origin: number[], destination: number[], steps: number): number[][] {
    const coordinates: number[][] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      // 计算贝塞尔曲线的控制点
      const controlPoint = [
        (origin[0] + destination[0]) / 2 - 5,
        (origin[1] + destination[1]) / 2 + 15 // 添加一个偏移量来创建弧度
      ]
      coordinates.push(this.bezierCurve(origin, controlPoint, destination, t))
    }
    return coordinates
  }

}

export default BezierCurveLine;
