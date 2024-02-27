import * as zrender from 'zrender/lib/zrender'
import Group from 'zrender/lib/graphic/Group'
import Path from 'zrender/lib/graphic/Path'
import PathProxy from "zrender/lib/core/PathProxy";
export function drawLine (dom: HTMLElement) {
  const zr = zrender.init(dom)
  const group = new Group()
  zr.add(group)

  const PathShape = Path.extend({
    type: 'path',
    shape: {
      path: []
    },
    buildPath(ctx: CanvasRenderingContext2D | PathProxy, shape) {
      ctx.moveTo(0, 0)
      ctx.lineTo(100, 100)
    }
  })
  const path = new PathShape({
    shape: {
      path: [0, 0, 100, 100]
    },
    style: {
      fill: '#fff',
      stroke: '#f00'
    }
  })
  group.add(path)
}