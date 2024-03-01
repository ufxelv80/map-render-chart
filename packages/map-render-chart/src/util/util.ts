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

interface CreatePolygonParams {
  type?: string
  callback(lng: number, lat: number): { x: number, y: number }
}

export function createPolygon (params: CreatePolygonParams): {
  new(opts?: (zrender.PathProps & {
    shape: { path: number[] },
    mapName?: string
    type?: string
  })): Path<PathProps>
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

// rgba颜色转换为16进制颜色
export function rgbaToHex (color: string): string {
  if (color === 'rgba(0, 0, 0, 0)') return 'rgba(0, 0, 0, 0)'
  const rgb = color.split(',')
  const r = parseInt(rgb[0].split('(')[1])
  const g = parseInt(rgb[1])
  const b = parseInt(rgb[2].split(')')[0])
  const hex = ((r << 16) | (g << 8) | b).toString(16)
  return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex
}

export function calculateOpacityAndGradientColor (maxValue: number, currentValue: number, startColor: string, endColor: string): string {
  if (currentValue === 0) return 'rgba(0, 0, 0, 0)'
  // 根据起始色和结束色的格式来转换或提取rgb数组
  let startRgb
  if (startColor.startsWith('#')) {
    startRgb = hexToRgb(startColor)
  } else if (startColor.startsWith('rgba')) {
    startRgb = rgbaToRgb(startColor)
  } else {
    throw new Error('Invalid start color format')
  }

  let endRgb
  if (endColor.startsWith('#')) {
    endRgb = hexToRgb(endColor)
  } else if (endColor.startsWith('rgba')) {
    endRgb = rgbaToRgb(endColor)
  } else {
    throw new Error('Invalid end color format')
  }

  // 假设最小值是0，或者根据最大值和当前值来推断最小值
  const minValue = Math.min(0, maxValue - currentValue)

  // 计算当前值相对于最大值的百分比，并限制在0到1之间
  const percentage = Math.max(0, Math.min(1, (currentValue - minValue) / (maxValue - minValue)))

  // 计算透明度，并限制在0到1之间
  const opacity = Math.max(0, Math.min(1, (percentage * percentage)))

  // 计算渐变颜色，使用线性插值公式，并限制在0到255之间
  const gradientRed = Math.max(0, Math.min(255, (Math.round((1 - percentage) * startRgb[0] + percentage * endRgb[0]))))
  const gradientGreen = Math.max(0, Math.min(255, (Math.round((1 - percentage) * startRgb[1] + percentage * endRgb[1]))))
  const gradientBlue = Math.max(0, Math.min(255, (Math.round((1 - percentage) * startRgb[2] + percentage * endRgb[2]))))

  // 返回rgba色值字符串
  return 'rgba(' + gradientRed + ',' + gradientGreen + ',' + gradientBlue + ',' + currentValue / maxValue + ')'
}

const RGBA_REGEX = /^rgba \((\d+), (\d+), (\d+), ([\d.]+)\)$/

// 定义一个函数来提取rgba颜色中的rgb数组
function rgbaToRgb (rgba: string) {
// 匹配rgba颜色格式，如果不匹配则返回空数组
  const match = rgba.match(RGBA_REGEX)
  if (!match) return []

  // 提取rgb值并转换为数字类型
  const rgb = []
  for (let i = 1; i <= 3; i++) {
    rgb.push(+match[i])
  }
  return rgb
}

function hexToRgb (hex: string) {
  // 去掉开头的#号
  hex = hex.replace(/^#/, '')
  // 如果是三位数的颜色，比如#f00，则扩展为六位数
  if (hex.length === 3) {
    hex = hex.replace(/([a-f0-9])/g, '$1$1')
  }
  // 解析十六进制颜色为rgb数组
  const rgb = []
  for (let i = 0; i < 6; i += 2) {
    rgb.push(parseInt(hex.substr(i, 2), 16))
  }
  return rgb
}

export function warn (msg: string): void {
  console.warn(`[map-render-chart] ${msg}`)
}

export function throwError (msg: string): void {
  throw new Error(`[map-render-chart] ${msg}`)
}

// 判断一个字符串是不是数字
export function isNumber (value: string): boolean {
  return !isNaN(Number(value))
}