import {Group, TextStyleProps} from "zrender";
import {AdministrativeAreaGeoJson} from "./GeoJson";
import type Transform from "../geo/transform";
import {CustomElement, MapNameFull} from "./Map";
import ZRText from "zrender/lib/graphic/Text";

export interface LabelOptions {
  // label: string
  // abbreviation: string
  geoJson: AdministrativeAreaGeoJson
  group: Group
  style: TextStyleProps,
  transform: Transform
  mapFullName: MapNameFull[]
  scale: number
  fullName: boolean
}

// 自定义 Text 类型
export type CustomText = ZRText & { centroid: number[] }