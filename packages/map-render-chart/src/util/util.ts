import { ZRenderType } from 'zrender'
import * as zrender from 'zrender'
import Path from "zrender/lib/graphic/Path";
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

// // 用法示例
// const debouncedMouseMove = debounce(function(event) {
//   console.log('Mouse coordinates:', event.clientX, event.clientY);
// }, 200);
//
// document.addEventListener('mousemove', debouncedMouseMove);

