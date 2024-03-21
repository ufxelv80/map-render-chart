import Map from './ui/map'
import Marker from './ui/marker'
import Icon from './ui/icon'
import Size from './ui/size'
import BezierCurveLine from './ui/bezier-curve'
import {useSetupRenderer} from "./util/hooks";
import {CanvasRenderer} from "./renderer/canvasRender";
import { getCurrentMapName, mapName as administrativeDivisionTree } from './util/province-city-county-name'
import LinearGradient from "zrender/lib/graphic/LinearGradient";

export * from './typing/GeoJson'
export * from './typing/Icon'
export * from './typing/InitMapEvent'
export * from './typing/Label'
export * from './typing/Map'
export * from './typing/Marker'
export * from './typing/Size'

useSetupRenderer([CanvasRenderer])
const mapRenderChart = {
  Map,
  Marker,
  Icon,
  Size,
  LinearGradient,
  BezierCurveLine,
  administrativeDivisionTree
}

export default mapRenderChart

export {
  Map,
  Marker,
  Icon,
  Size,
  LinearGradient,
  BezierCurveLine,
  getCurrentMapName,
  administrativeDivisionTree
}


