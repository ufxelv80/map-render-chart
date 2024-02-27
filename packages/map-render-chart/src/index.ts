import Map from './ui/map'
import Marker from './ui/marker'
import Icon from './ui/icon'
import Size from './ui/size'
import {useSetupRenderer} from "./util/hooks";
import {CanvasRenderer} from "./renderer/canvasRender";
import { drawLine } from './test/testRender'

useSetupRenderer([CanvasRenderer])
const mapRenderGL = {
  Map,
  Marker,
  Icon,
  Size
}

export default mapRenderGL

export {
  Map,
  Marker,
  Icon,
  Size,
  drawLine
}


