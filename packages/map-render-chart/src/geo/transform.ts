import {AdcodeBoundaryGeoJson} from '../typing/GeoJson'

class Transform {
  private readonly _adcode: number;
  private _width: number;
  private _height: number;
  boxBound: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }

  constructor(container: HTMLElement, adcode: number) {
    this._adcode = adcode
    this._width = container.offsetWidth
    this._height = container.offsetHeight

    this.boxBound = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    }
  }

  _getBounds(geoJson: AdcodeBoundaryGeoJson, type?: string): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number
  } {
    // 109.69328,18.164892
    if (this._adcode === 100000 && !type) {
      this.boxBound = {
        minX: 73.508989,
        minY: 18.164892,
        maxX: 135.102112,
        maxY: 53.569188
      }
    } else {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      geoJson.features.forEach(feature => {
        feature.geometry.coordinates.forEach(coords => {
          coords.forEach(coord => {
            if (Array.isArray(coord) && coord.length > 2) {
              coord.forEach(item => {
                minX = Math.min(minX, (item as unknown as number[])[0])
                minY = Math.min(minY, (item as unknown as number[])[1])
                maxX = Math.max(maxX, (item as unknown as number[])[0])
                maxY = Math.max(maxY, (item as unknown as number[])[1])
              })
            } else {
              minX = Math.min(minX, (coord as number[])[0])
              minY = Math.min(minY, (coord as number[])[1])
              maxX = Math.max(maxX, (coord as number[])[0])
              maxY = Math.max(maxY, (coord as number[])[1])
            }
          })
        })
      })
      this.boxBound = {minX, minY, maxX, maxY}
    }
    return this.boxBound
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
    return { lng, lat };
  }


  setContainerWidth(width: number) {
    this._width = width
  }

  setContainerHeight(height: number) {
    this._height = height
  }
}

export default Transform
