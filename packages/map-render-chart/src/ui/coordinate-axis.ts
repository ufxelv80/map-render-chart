import Group from "zrender/lib/graphic/Group";
import Line from "zrender/lib/graphic/shape/Line";
import Circle from "zrender/lib/graphic/shape/Circle";

class CoordinateAxis {
  private group: Group;
  private readonly _width: number;
  private readonly _height: number;
  private coordinateAxisGroup: Group;
  constructor(group: Group, coordinateAxisGroup: Group, width: number, height: number) {
    this.group = group
    this._width = width
    this._height = height
    this.coordinateAxisGroup = coordinateAxisGroup
  }

  /**
   * 绘制坐标轴
   * */
  _drawCoordinateAxis(size: number = 200): void {
    const Rect = this.group.getBoundingRect()
    this._drawLineX(size)
    this._drawLineY(size)

    // 地图中心点
    const mapCenter = {
      x: Rect.x + Rect.width / 2,
      y: Rect.y + Rect.height / 2
    }
    console.log(mapCenter)
    this._drawCenterPoint(mapCenter)
  }

  _drawLineX(size: number): void {
    const line = new Line({
      shape: {
        x1: this._width / 2 - size,
        y1: this._height / 2,
        x2: this._width / 2 + size,
        y2: this._height / 2
      },
      style: {
        stroke: 'red'
      },
      zlevel: 100
    })
    this.coordinateAxisGroup.add(line)
  }

  _drawLineY(size: number): void {
    const line = new Line({
      shape: {
        x1: this._width / 2,
        y1: this._height / 2 - size,
        x2: this._width / 2,
        y2: this._height / 2 + size
      },
      style: {
        stroke: 'green'
      },
      zlevel: 100
    })
    this.coordinateAxisGroup.add(line)
  }

  _drawCenterPoint(center: { x: number, y: number }): void {
    const circle = new Circle({
      shape: {
        cx: this._width / 2,
        cy: this._height / 2,
        r: 5
      },
      style: {
        fill: 'rgba(200,0,255,1)',
      },
      zlevel: 100
    })
    this.coordinateAxisGroup.add(circle)
  }
}

export default CoordinateAxis