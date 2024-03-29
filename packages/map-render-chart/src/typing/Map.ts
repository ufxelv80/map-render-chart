import {Features} from "./GeoJson";
import {ElementEvent, PathStyleProps, Element as ZRElement, ElementProps} from "zrender"
import {TextStyleProps} from "zrender";

export interface MapOptions {
  container: HTMLElement | string
  zoom?: number
  style?: PathStyleProps,
  level?: number
  boundBox?: BoundBoxOptions
  // 辅助线
  auxiliaryLine?: boolean
  minZoom?: number
  maxZoom?: number
}

export interface BoundBoxOptions {
  show: boolean
  style?: PathStyleProps
  level?: number
}

export type MapEventKey =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mousemove'
  | 'mouseup'
  | 'mousewheel'
  | 'resize'
  | 'mouseout'

export enum MapEventType {
  CLICK = 'click',
  DBLCLICK = 'dblclick',
  MOUSEDOWN = 'mousedown',
  MOUSEMOVE = 'mousemove',
  MOUSEUP = 'mouseup',
  MOUSEWHEEL = 'mousewheel',
  RESIZE = 'resize',
  MOUSEOUT = 'mouseout'
}

type ZRenderElement = ZRElement & ({
  attr(key: (keyof ZRElement) | 'style', value: any): void
} | {
  attr(value: any): void
})

export interface MapElement extends ZRElement {
  data: MapData
}

export type MapElementEvent = ElementEvent & {
  metadata: Features,
  target: MapElement
  centroid: [number, number]
  event: {
    "isTrusted": boolean
    "zrX": number
    "zrY": number
    "zrDelta": number
    pageX: number
    pageY: number
  }
}

export interface AddTooltipOptions {
  top?: number
  left?: number
  offsetX?: number
  offsetY?: number
}

export interface MapBgOpt {
  width: number
  height: number
  x: number
  y: number
}

export interface MapProjectionLayerConfig {
  style: PathStyleProps
  offset: {
    x: number
    y: number
  },
  level: number
}

export interface MapData {
  name: string
  value: number
  style?: PathStyleProps
  [x: string]: any
}

export interface MapNameFull {
  adcode: number
  name: string
  abbreviation: string
  abbreviation2?: string
  children?: MapNameFull[]
  center: number[]
  centroid: number[]
}

export interface ShowMapNameParams {
  style: TextStyleProps,
  fullName?: boolean
}

// 自定义 Element 接口
export type CustomElement = ZRElement<ElementProps> & {
  mapName?: string
}
