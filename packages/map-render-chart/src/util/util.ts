import { ZRenderType } from 'zrender'
import * as zrender from 'zrender'
import Path, {PathProps} from "zrender/lib/graphic/Path";
import {BoundGeoJson} from "../typing/GeoJson";
export function createElement<T extends keyof HTMLElementTagNameMap> (type: T, className?: string, container?: HTMLElement): HTMLElementTagNameMap[T] {
  const el = document.createElement(type)
  if (className) el.className = className
  if (container) container.appendChild(el)
  return el
}

const authenticatedMaps = new Set()
export function storeAuthState (ctx: ZRenderType, state: boolean): void {
  if (state) {
    authenticatedMaps.add(ctx)
  } else {
    authenticatedMaps.delete(ctx)
  }
}

interface createPolygonParams {
  type: string
  callback(lng: number, lat: number): { x: number, y: number }
}

export function createPolygon (params: createPolygonParams): {
  new(opts?: (zrender.PathProps & { shape: { path: number[] } })): zrender.Path<zrender.PathProps>
} {
  const { type, callback } = params
  return Path.extend<{ path: number[] }>({
    type,
    shape: {
      path: []
    },
    buildPath: function (ctx: CanvasRenderingContext2D, shape) {
      shape.path.forEach((item, index) => {
        const latLng = item as unknown as number[]
        const { x, y } = callback ? callback(latLng[0], latLng[1]) : { x: latLng[0], y: latLng[1] }
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
    }
  })
}

interface ForEachBoundGeoJsonParams {
  geoJson: BoundGeoJson
  callback(path: number[]):  Path<PathProps>
}

// geoJson 数据遍历操作
export function forEachBoundGeoJson (geoJson: BoundGeoJson):  number[][][] {
  const pathArray: number[][][] = []
  geoJson.features.forEach((feature) => {
    const dimension = getArrayDimension(feature.geometry.coordinates)
    if (dimension === 3) {
      const coords = feature.geometry.coordinates as number[][][]
      coords.forEach((coords) => {
        pathArray.push(coords)
      })
    }
    if (dimension === 4) {
      const coords = feature.geometry.coordinates as number[][][][]
      coords.forEach((coords) => {
        coords.forEach((coord) => {
          pathArray.push(coord)
        })
      })
    }
  })
  return pathArray
}

function getArrayDimension(arr: any): number {
  if (!Array.isArray(arr)) {
    return 0; // 不是数组
  }
  let maxDimension = 0;
  for (const item of arr) {
    // 递归地检查每个元素
    const dimension = getArrayDimension(item);
    maxDimension = Math.max(maxDimension, dimension);
  }
  return 1 + maxDimension; // 当前数组层级加上子数组的最大深度
}

