import Map from './ui/map'
import Marker from './ui/marker'
import Icon from './ui/icon'
import Size from './ui/size'
import {useSetupRenderer} from "./util/hooks";
import {CanvasRenderer} from "./renderer/canvasRender";
import { drawLine } from './test/testRender'
import { getCurrentMapName } from './util/province-city-county-name'
export * from './typing/GeoJson'
export * from './typing/Icon'
export * from './typing/InitMapEvent'
export * from './typing/Label'
export * from './typing/Map'
export * from './typing/Marker'
export * from './typing/Size'

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
  drawLine,
  getCurrentMapName
}


