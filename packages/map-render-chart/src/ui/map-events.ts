import {ElementEvent, Group, ZRenderType} from 'zrender'
import * as matrix from 'zrender/lib/core/matrix'
import {BoundingRect} from "zrender";

interface LastScaleOffset {
  totalScale: number | undefined
  currentCenterX: number | undefined
  currentCenterY: number | undefined
}

interface ElementEventParams {
  zr: ZRenderType & { __testRoamableMounted?: boolean | undefined },
  root: Group,
  scale: { maxScale: number, minScale: number },

  updateState(state: {
    scale: number
    offsetX: number
    offsetY: number
  }): void

  isEnableDragging?: boolean,
  isEnableScaling?: boolean,
  handler?: boolean
}

export function initMapEvent(options: ElementEventParams): { roamable: () => void } {
  let {zr, root, isEnableDragging = false, isEnableScaling = false, scale, updateState, handler} = options
  let roots: { root: Group, handler: boolean }[] = []
  const rawTransformable = new Group() as Group & { scale: number }
  const roamTransformable = new Group()
  roamTransformable.add(rawTransformable)

  let moving: boolean | number[] = false

  function roamable(): void {
    roots = []
    const indexExists = find(root)

    if (!zr || !root) {
      roots.length = 0
      return
    }

    if (handler === false) {
      if (indexExists >= 0) {
        roots.splice(indexExists, 1)
      }
      return
    }

    if (indexExists >= 0) {
      return
    }

    // 可缩放

    roots.push({root: root, handler: handler || false})
    if (!zr.__testRoamableMounted) {
      root.on('mousewheel', (e) => {
        if (!isEnableScaling) return
        handleMouseWheel(e)
      })
      root.on('mousedown', handleMouseDown)
      isEnableDragging && root.on('mousemove', handleMouseMove)
      root.on('mouseup', handleMouseUp)
      zr.__testRoamableMounted = true
    }
  }

  function find(root: Group): number {
    for (let i = 0; i < roots.length; i++) {
      if (roots[i].root === root) {
        return i
      }
    }
    return -1
  }

  let startMousePos: number[] | undefined = void 0

  // 缩放且移动后的中心点
  let scaleMovingCenter = {
    rectCenterX: 0,
    rectCenterY: 0
  }
  // 上次偏移量
  const lastOffset = {
    x: 0,
    y: 0
  }

  // 记录上一次缩放后的中心位置和累积缩放比例
  const lastScale: LastScaleOffset = {
    totalScale: undefined,
    currentCenterX: undefined,
    currentCenterY: undefined
  }

  function handleMouseDown(e: ElementEvent) {
    startMousePos = [e.offsetX, e.offsetY]
    moving = [e.offsetX, e.offsetY]
  }

  function handleMouseUp(e: ElementEvent) {
    moving = false
    const rect = root.getBoundingRect()
    const {rectCenterX, rectCenterY} = getMovingCenterPosition(e, rect)
    lastOffset.x = rectCenterX - (rect.x + rect.width / 2)
    lastOffset.y = rectCenterY - (rect.y + rect.height / 2)


    lastScale.currentCenterX = rectCenterX
    lastScale.currentCenterY = rectCenterY
    lastScale.totalScale = root.scaleX
  }

  // 图形拖拽
  function handleMouseMove(e: ElementEvent) {
    if (!moving) {
      return
    }
    const pointerPos = [e.offsetX, e.offsetY]
    for (let i = 0; i < roots.length; i++) {
      updateTransform(
        roots[i],
        [pointerPos[0] - (moving as number[])[0], pointerPos[1] - (moving as number[])[1]],
        [1, 1],
        [0, 0]
      )
      // getMovingCenterPoint(e, roots[i].root)

      getMovingCenterOffset(e, roots[i].root)
    }
    moving = pointerPos
  }

  // 计算当前图形的中心点
  function getMovingCenterOffset(e: ElementEvent, root: Group) {
    const rect = root.getBoundingRect()
    // getMovingCenterPosition(e, rect)
    const {rectCenterX, rectCenterY} = getMovingCenterPosition(e, rect)
    scaleMovingCenter = {
      rectCenterX: rectCenterX - (rect.x + rect.width / 2),
      rectCenterY: rectCenterY - (rect.y + rect.height / 2)
    }

    updateState && updateState({
      scale: 0.8 * root.scaleX,
      offsetX: scaleMovingCenter.rectCenterX,
      offsetY: scaleMovingCenter.rectCenterY
    })
  }

  function getMovingCenterPosition(e: ElementEvent, rect: BoundingRect) {
    // 计算图形原始中心点
    const originX = rect.x + rect.width / 2
    const originY = rect.y + rect.height / 2
    if (!startMousePos) {
      return {
        rectCenterX: originX,
        rectCenterY: originY
      }
    }

    const currentCenterX = lastScale.currentCenterX !== undefined ? lastScale.currentCenterX : originX
    const currentCenterY = lastScale.currentCenterY !== undefined ? lastScale.currentCenterY : originY

    //   // 鼠标偏移的 X, Y 坐标
    const offsetX = e.offsetX - startMousePos[0]
    const offsetY = e.offsetY - startMousePos[1]

    const rectCenterX = currentCenterX + offsetX
    const rectCenterY = currentCenterY + offsetY

    return {
      rectCenterX,
      rectCenterY
    }

  }

  // 计算平移后中心点位置
  // function getMovingCenterPosition (e: ElementEvent, rect: BoundingRect) {
  //   // 计算图形原始中心点
  //   const originX = rect.x + rect.width / 2
  //   const originY = rect.y + rect.height / 2
  //   if (!startMousePos) {
  //     return {
  //       rectCenterX: originX,
  //       rectCenterY: originY
  //     }
  //   }
  //   // 鼠标偏移的 X, Y 坐标
  //   const offsetX = e.offsetX - startMousePos[0]
  //   const offsetY = e.offsetY - startMousePos[1]
  //   // Rect 的初始化坐标
  //   // const rect = root.getBoundingRect()
  //   // 当前 rect 的 x, y 坐标
  //   const rectX = rect.x + offsetX
  //   const rectY = rect.y + offsetY
  //   // 移动后 rect 的中心点坐标
  //   const rectCenterX = (rectX + rect.width / 2) + lastOffset.x
  //   const rectCenterY = (rectY + rect.height / 2) + lastOffset.y
  //
  //   console.log(rectCenterX, rectCenterY)
  //
  //
  //   lastScale.currentCenterX = rectCenterX
  //   lastScale.currentCenterY = rectCenterY
  //   lastScale.totalScale = root.scaleX
  //
  //   return {
  //     rectCenterX,
  //     rectCenterY
  //   }
  // }

  function handleMouseWheel(e: ElementEvent) {
    // 设定最小缩放比例
    const minScale = scale.minScale
    e.stop()

    const wheelDelta = e.wheelDelta
    const absWheelDeltaDelta = Math.abs(wheelDelta)
    const originX = e.offsetX
    const originY = e.offsetY

    // wheelDelta maybe -0 in chrome mac.
    if (wheelDelta === 0) {
      return
    }

    const factor = absWheelDeltaDelta > 3 ? 1.4 : absWheelDeltaDelta > 1 ? 1.2 : 1.1
    const scaleDelta = wheelDelta > 0 ? factor : 1 / factor
    for (let i = 0; i < roots.length; i++) {
      const rect = roots[i].root.getBoundingRect()
      if ((wheelDelta < 0 && roots[i].root.scaleX < minScale) || (wheelDelta > 0 && roots[i].root.scaleX > scale.maxScale)) {
        return
      }
      updateTransform(roots[i], [0, 0], [scaleDelta, scaleDelta], [originX, originY])
      // console.log(lastScaleOffset.rectCenterX + (rect.x + rect.width / 2), lastScaleOffset.rectCenterY + (rect.y + rect.height / 2))
      getScaleCenterOffset(e, roots[i].root)
    }
  }

  // 计算缩放后中心点的偏移量
  function getScaleCenterOffset(e: ElementEvent, group: Group) {
    const rect = group.getBoundingRect();
    // 原始中心点位置
    const originX = rect.x + rect.width / 2;
    const originY = rect.y + rect.height / 2;
    // 假设有个全局变量来存储当前中心点和累积缩放比例
    // 如果这是第一次缩放，则使用原始值
    let currentCenterX = lastScale.currentCenterX !== undefined ? lastScale.currentCenterX : originX;
    let currentCenterY = lastScale.currentCenterY !== undefined ? lastScale.currentCenterY : originY;
    let totalScale = lastScale.totalScale !== undefined ? lastScale.totalScale : 1;

    // 缩放后的等级
    const scaleAfter = group.scaleX;
    const scaleBefore = totalScale;
    // 更新全局的累积缩放比例
    totalScale = scaleAfter;
    lastScale.totalScale = totalScale;

    const offsetX = (e.offsetX - currentCenterX) * (scaleAfter / scaleBefore - 1);
    const offsetY = (e.offsetY - currentCenterY) * (scaleAfter / scaleBefore - 1);

    // 更新中心点位置
    const newCenterX = currentCenterX - offsetX;
    const newCenterY = currentCenterY - offsetY;

    updateState && updateState({
      scale: 0.8 * group.scaleX,
      offsetX: newCenterX - originX,
      offsetY: newCenterY - originY
    })

    // 保存新的中心点位置为下一次缩放准备
    lastScale.currentCenterX = newCenterX;
    lastScale.currentCenterY = newCenterY;
  }


  function updateTransform(rootRecord: {
    root: Group,
    handler: boolean | ((root: Group) => void)
  }, positionDeltas: number[], scaleDeltas: number[], origin: number[]) {
    const root = rootRecord.root
    // console.log(root)

    rawTransformable.scaleX = root.scaleX
    rawTransformable.scaleY = root.scaleY
    rawTransformable.x = root.x
    rawTransformable.y = root.y
    rawTransformable.originX = root.originX
    rawTransformable.originY = root.originY
    rawTransformable.rotation = root.rotation

    roamTransformable.scaleX = scaleDeltas[0]
    roamTransformable.scaleY = scaleDeltas[1]
    roamTransformable.originX = origin[0]
    roamTransformable.originY = origin[1]
    roamTransformable.x = positionDeltas[0]
    roamTransformable.y = positionDeltas[1]

    roamTransformable.updateTransform()
    rawTransformable.updateTransform()

    matrix.copy(
      root.transform || (root.transform = []),
      rawTransformable.transform || matrix.create()
    )

    root.decomposeTransform()
    root.dirty()

    const handler = rootRecord.handler as (root: Group) => void
    handler && handler(root)
  }

  return {
    roamable
  }
}
