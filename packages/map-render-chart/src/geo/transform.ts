import {AdministrativeAreaGeoJson, BoundGeoJson} from '../typing/GeoJson'
import union from '@turf/union'
import bbox from '@turf/bbox'
import {forEachBoundGeoJson} from "../util/util";

class Transform {
  private _width: number;
  private _height: number;
  private geoJson: BoundGeoJson;
  boxBound: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }

  constructor(container: HTMLElement) {
    this._width = container.offsetWidth
    this._height = container.offsetHeight

    this.boxBound = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    }
  }

  _getBounds(): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number
  } {
    const bboxBound = bbox(this.geoJson)
    this.boxBound = {minX: bboxBound[0], minY: bboxBound[1], maxX: bboxBound[2], maxY: bboxBound[3]}
    return this.boxBound
  }

  /**
   * 提取边界值
   * */
  getGeoJsonBounds(geoJson: AdministrativeAreaGeoJson): BoundGeoJson {
    const merged = geoJson.features.reduce((acc, feature) => {
      if (!acc) return feature;
      return union(acc as any, feature as any);
    }, null);
    const mergedJeoJson = {
      type: geoJson.type,
      features: [
        {
          type: geoJson.features[0].type,
          properties: geoJson.features[0].properties,
          geometry: merged.geometry
        }
      ]
    }
    // console.log(merged)
    this.geoJson = mergedJeoJson
    return mergedJeoJson
  }

  calculateOffset(mapScale: number, lng: number, lat: number): { x: number, y: number } {
    const height = this._height
    const width = this._width
    const bounds = this.boxBound
    const offsetValue = 2
    const scale = Math.min(width / (bounds.maxX - bounds.minX), height / (bounds.maxY - bounds.minY)) * mapScale
    const offsetX = (width - (bounds.maxX - bounds.minX) * scale) / offsetValue
    const offsetY = (height - (bounds.maxY - bounds.minY) * scale) / offsetValue
    const x = (lng - bounds.minX) * scale + offsetX
    const y = (bounds.maxY - lat) * scale + offsetY
    return {x, y}
  }

  reverseCalculateOffset(
    mapScale: number,
    x: number,
    y: number,
    currentOffsetX = 0,
    currentOffsetY = 0
  ) {

    const height = this._height;
    const width = this._width;
    const bounds = this.boxBound;
    const offsetValue = 2;

    // Calculate scale
    const scale = Math.min(width / (bounds.maxX - bounds.minX), height / (bounds.maxY - bounds.minY)) * mapScale;

    // Calculate offset
    const offsetX = (width - (bounds.maxX - bounds.minX) * scale) / offsetValue + currentOffsetX
    const offsetY = (height - (bounds.maxY - bounds.minY) * scale) / offsetValue + currentOffsetY

    // Reverse calculation to find longitude and latitude
    const lng = (x - offsetX) / scale + bounds.minX;
    const lat = bounds.maxY - (y - offsetY) / scale;
    return {lng, lat};
  }


  setContainerWidth(width: number) {
    this._width = width
  }

  setContainerHeight(height: number) {
    this._height = height
  }
}

export default Transform
