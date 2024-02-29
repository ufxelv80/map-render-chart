import {InitMapEventOptions, MovePoint} from "../typing/InitMapEvent";
import {BoundingRect, ElementEvent, Group} from "zrender";
import * as matrix from "zrender/lib/core/matrix";

interface LastScaleOffset {
  totalScale: number | undefined
  currentCenterX: number | undefined
  currentCenterY: number | undefined
}

class InitMapEvent {
  private readonly rawTransformable: Group & { scale: number }
  private roamTransformable: Group
  private moving: boolean | number[]
  private roots: { root: Group, handler: boolean }[]
  private readonly options: InitMapEventOptions
  private startMousePos: number[] | undefined = void 0
  private scaleMovingCenter: MovePoint
  private lastOffset: { x: number, y: number }
  private lastScale: LastScaleOffset
  constructor(option: InitMapEventOptions) {
    this.options = option
    this.rawTransformable = new Group() as Group & { scale: number }
    this.roamTransformable = new Group()
    this.roamTransformable.add(this.rawTransformable)
    this.moving = false
    this.startMousePos = void 0
    this.scaleMovingCenter = {
      rectCenterX: 0,
      rectCenterY: 0
    }
    this.lastOffset = {
      x: 0,
      y: 0
    }
    this.lastScale = {
      totalScale: undefined,
      currentCenterX: undefined,
      currentCenterY: undefined
    }
  }

  roamable(): void {
    this.roots = []
    const indexExists = this.find(this.options.root)

    if (!this.options.zr || !this.options.root) {
      this.roots.length = 0
      return
    }

    if (this.options.handler === false) {
      if (indexExists >= 0) {
        this.roots.splice(indexExists, 1)
      }
      return
    }

    if (indexExists >= 0) {
      return
    }

    // 可缩放

    this.roots.push({root: this.options.root, handler: this.options.handler || false})
    if (!this.options.zr.__testRoamableMounted) {
      this.options.root.on('mousewheel', (e) => {
        if (!this.options.isEnableScaling) return
        this.handleMouseWheel(e)
      })
      this.options.root.on('mousedown', (e) => {
        this.handleMouseDown(e)
      })
      this.options.root.on('mousemove', (e) => {
        if (!this.options.isEnableDragging) return
        this.handleMouseMove(e)
      })
      this.options.root.on('mouseup', (e) => {
        this.handleMouseUp(e)
      })
      this.options.zr.__testRoamableMounted = true
    }
  }

  find(root: Group): number {
    for (let i = 0; i < this.roots.length; i++) {
      if (this.roots[i].root === root) {
        return i
      }
    }
    return -1
  }

  handleMouseWheel (e: ElementEvent) {
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

    for (let i = 0; i < this.roots.length; i++) {
      if ((wheelDelta < 0 && this.roots[i].root.scaleX < this.options.scale.minScale) || (wheelDelta > 0 && this.roots[i].root.scaleX > this.options.scale.maxScale)) {
        return
      }
      this.updateTransform(this.roots[i], [0, 0], [scaleDelta, scaleDelta], [originX, originY])
      // console.log(lastScaleOffset.rectCenterX + (rect.x + rect.width / 2), lastScaleOffset.rectCenterY + (rect.y + rect.height / 2))
      this.getScaleCenterOffset(e, this.roots[i].root)
    }
  }

  handleMouseDown (e: ElementEvent) {
    this.startMousePos = [e.offsetX, e.offsetY]
    this.moving = [e.offsetX, e.offsetY]
  }

  handleMouseMove (e: ElementEvent) {
    if (!this.moving) {
      return
    }
    const pointerPos = [e.offsetX, e.offsetY]
    for (let i = 0; i < this.roots.length; i++) {
      this.updateTransform(
        this.roots[i],
        [pointerPos[0] - (this.moving as number[])[0], pointerPos[1] - (this.moving as number[])[1]],
        [1, 1],
        [0, 0]
      )
      // getMovingCenterPoint(e, roots[i].root)

      this.getMovingCenterOffset(e, this.roots[i].root)
    }
    this.moving = pointerPos
  }

  handleMouseUp (e: ElementEvent) {
    this.moving = false
    const rect = this.options.root.getBoundingRect()
    const {rectCenterX, rectCenterY} = this.getMovingCenterPosition(e, rect)
    this.lastOffset.x = rectCenterX - (rect.x + rect.width / 2)
    this.lastOffset.y = rectCenterY - (rect.y + rect.height / 2)


    this.lastScale.currentCenterX = rectCenterX
    this.lastScale.currentCenterY = rectCenterY
    this.lastScale.totalScale = this.options.root.scaleX
  }

  getMovingCenterPosition(e: ElementEvent, rect: BoundingRect) {
    // 计算图形原始中心点
    const originX = rect.x + rect.width / 2
    const originY = rect.y + rect.height / 2
    if (!this.startMousePos) {
      return {
        rectCenterX: originX,
        rectCenterY: originY
      }
    }

    const currentCenterX = this.lastScale.currentCenterX !== undefined ? this.lastScale.currentCenterX : originX
    const currentCenterY = this.lastScale.currentCenterY !== undefined ? this.lastScale.currentCenterY : originY

    //   // 鼠标偏移的 X, Y 坐标
    const offsetX = e.offsetX - this.startMousePos[0]
    const offsetY = e.offsetY - this.startMousePos[1]

    const rectCenterX = currentCenterX + offsetX
    const rectCenterY = currentCenterY + offsetY

    return {
      rectCenterX,
      rectCenterY
    }

  }

  getMovingCenterOffset(e: ElementEvent, root: Group) {
    const rect = root.getBoundingRect()
    // getMovingCenterPosition(e, rect)
    const {rectCenterX, rectCenterY} = this.getMovingCenterPosition(e, rect)
    this.scaleMovingCenter = {
      rectCenterX: rectCenterX - (rect.x + rect.width / 2),
      rectCenterY: rectCenterY - (rect.y + rect.height / 2)
    }

    this.options.updateState && this.options.updateState({
      scale: this.options.zoom * root.scaleX,
      offsetX: this.scaleMovingCenter.rectCenterX,
      offsetY: this.scaleMovingCenter.rectCenterY
    })
  }

  getScaleCenterOffset(e: ElementEvent, group: Group) {
    const rect = group.getBoundingRect();
    // 原始中心点位置
    const originX = rect.x + rect.width / 2;
    const originY = rect.y + rect.height / 2;
    // 假设有个全局变量来存储当前中心点和累积缩放比例
    // 如果这是第一次缩放，则使用原始值
    let currentCenterX = this.lastScale.currentCenterX !== undefined ? this.lastScale.currentCenterX : originX;
    let currentCenterY = this.lastScale.currentCenterY !== undefined ? this.lastScale.currentCenterY : originY;
    let totalScale = this.lastScale.totalScale !== undefined ? this.lastScale.totalScale : 1;

    // 缩放后的等级
    const scaleAfter = group.scaleX;
    const scaleBefore = totalScale;
    // 更新全局的累积缩放比例
    totalScale = scaleAfter;
    this.lastScale.totalScale = totalScale;

    const offsetX = (e.offsetX - currentCenterX) * (scaleAfter / scaleBefore - 1);
    const offsetY = (e.offsetY - currentCenterY) * (scaleAfter / scaleBefore - 1);

    // 更新中心点位置
    const newCenterX = currentCenterX - offsetX;
    const newCenterY = currentCenterY - offsetY;

    this.options.updateState && this.options.updateState({
      scale: this.options.zoom * group.scaleX,
      offsetX: newCenterX - originX,
      offsetY: newCenterY - originY
    })

    // 保存新的中心点位置为下一次缩放准备
    this.lastScale.currentCenterX = newCenterX;
    this.lastScale.currentCenterY = newCenterY;
  }

  updateTransform(rootRecord: { root: Group, handler: boolean | ((root: Group) => void) }, positionDeltas: number[], scaleDeltas: number[], origin: number[]) {
    const root = rootRecord.root
    // console.log(root)

    this.rawTransformable.scaleX = root.scaleX
    this.rawTransformable.scaleY = root.scaleY
    this.rawTransformable.x = root.x
    this.rawTransformable.y = root.y
    this.rawTransformable.originX = root.originX
    this.rawTransformable.originY = root.originY
    this.rawTransformable.rotation = root.rotation

    this.roamTransformable.scaleX = scaleDeltas[0]
    this.roamTransformable.scaleY = scaleDeltas[1]
    this.roamTransformable.originX = origin[0]
    this.roamTransformable.originY = origin[1]
    this.roamTransformable.x = positionDeltas[0]
    this.roamTransformable.y = positionDeltas[1]

    this.roamTransformable.updateTransform()
    this.rawTransformable.updateTransform()

    matrix.copy(
      root.transform || (root.transform = []),
      this.rawTransformable.transform || matrix.create()
    )

    root.decomposeTransform()
    root.dirty()

    const handler = rootRecord.handler as (root: Group) => void
    handler && handler(root)
  }

  setMapZoom(opt: { minZoom: number, maxZoom: number }) {
    this.options.scale.minScale = opt.minZoom
    this.options.scale.maxScale = opt.maxZoom
  }

  enableScrollWheelZoom(status: boolean) {
    this.options.isEnableScaling = status
  }

  enableDragging(status: boolean) {
    this.options.isEnableDragging = status
  }

}

export default InitMapEvent