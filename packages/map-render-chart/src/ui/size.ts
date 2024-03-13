import {SizeOptions} from "../typing";

class Size {
  private readonly _width: number
  private readonly _height: number
  constructor(width: SizeOptions['width'], height: SizeOptions['height']) {
    this._width = width
    this._height = height
  }
  get getWidth(): number {
    return this._width
  }
  get getHeight(): number {
    return this._height
  }
}

export default Size