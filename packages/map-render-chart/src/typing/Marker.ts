import Icon from "../ui/icon";
import {PathStyleProps} from "zrender";
import type Size from "../ui/size";

export interface MarkerOptions {
  center: [number, number]
  geoType?: 'pixel' | 'geo'
  icon?: Icon
  style?: PathStyleProps
  size?: Size
}

export type MarkerEventKey =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mousemove'
  | 'mouseup'
  | 'mouseout'

export enum MarkerEventType {
  click = 'click',
  dblclick = 'dblclick',
  mousedown = 'mousedown',
  mousemove = 'mousemove',
  mouseup = 'mouseup',
  mouseout = 'mouseout'
}