import Icon from "../ui/icon";

export interface MarkerOptions {
  center: [number, number]
  geoType?: 'pixel' | 'geo'
  icon?: Icon
}

export type MarkerEventKey =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mousemove'
  | 'mouseup'
  | 'mouseout'