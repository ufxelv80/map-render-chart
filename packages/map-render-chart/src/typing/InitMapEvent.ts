import {Group, ZRenderType} from "zrender";

export interface InitMapEventOptions {
  zr: ZRenderType & { __testRoamableMounted?: boolean | undefined },
  root: Group,
  scale: { maxScale: number, minScale: number },
  zoom: number,

  updateState(state: {
    scale: number
    offsetX: number
    offsetY: number
  }): void

  isEnableDragging?: boolean,
  isEnableScaling?: boolean,
  handler?: boolean
}

export interface MovePoint { rectCenterX: number, rectCenterY: number }