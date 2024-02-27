import {IconOptions} from "../typing/Icon";
import Rect from "zrender/lib/graphic/shape/Rect";
import ZRImage from "zrender/lib/graphic/Image";

class Icon {
  private readonly _url: string
  private readonly _width: number
  private readonly _height: number
  constructor(options: IconOptions) {
    this._url = options.url
    this._width = options.size.getWidth
    this._height = options.size.getHeight
  }

  _createIcon(x: number, y: number): ZRImage {
    // 绘制矩形
    const rect = new Rect({
      shape: {
        x: x - this._width / 2,
        y: y - this._height / 2,
        width: this._width,
        height: this._height
      },
      style: {}
    })
    const image = new ZRImage({
      style: {
        image: this._url,
        x: x - this._width / 2,
        y: y - this._height / 2,
        width: this._width,
        height: this._height
      },
      zlevel: 100
    })
    image.setClipPath(rect as any)
    image.type = 'marker'
    return image
  }
}

export default Icon