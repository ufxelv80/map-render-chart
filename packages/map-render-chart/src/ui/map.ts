import {
  AddTooltipOptions,
  BoundBoxOptions,
  MapElementEvent,
  MapEventKey,
  // MapElementEvent,
  MapEventType,
  MapOptions
} from '../typing/Map'
import Transform from '../geo/transform'
import {getAdcodeBoundary, getAdcodeGeoJson} from '../util/ajax'
import {AdcodeBoundaryGeoJson, Features} from '../typing/GeoJson'
import {createElement, createPolygon, storeAuthState} from '../util/util'
import * as zrender from 'zrender/lib/zrender'
import Group from "zrender/lib/graphic/Group";
import {ElementEvent, PathStyleProps, ZRenderType} from "zrender";
import Path, {PathProps} from "zrender/lib/graphic/Path";
import type Marker from "./marker";
import { Ref, ref } from '@vue/reactivity'
import {watch} from "@vue/runtime-core";
import {initMapEvent} from "./map-events";
import CoordinateAxis from "./coordinate-axis";
import Circle from "zrender/lib/graphic/shape/Circle";

const defaultOptions: {
  scale: number
} = {
  scale: 1
}

class Map {
  private readonly _container: HTMLElement | null
  private transform: Transform | undefined;
  private _adcode: number;
  private _mapGeoJsonBound: Ref<AdcodeBoundaryGeoJson> | undefined;
  protected _mapGeoJsonFull: AdcodeBoundaryGeoJson | undefined;
  private group: Group | undefined;
  private coordinateAxisGroup: Group | undefined;
  private _scale: number
  private _eventMap: Set<{ [key in MapEventKey]?: (params: MapElementEvent) => void }>;
  private _zr: ZRenderType;
  private readonly _markers: Marker[];
  private _oldAdcode: number | undefined
  private readonly _style: PathStyleProps | undefined
  private _boundBox: BoundBoxOptions
  private readonly _level: number
  private _initializeSuccess: Ref<boolean>
  private currentOffsetX: number;
  private currentOffsetY: number;
  private _auxiliaryLine: boolean;

  constructor(options: MapOptions) {
    options = Object.assign({}, defaultOptions, options)
    this._scale = options.scale

    if (typeof options.container === 'string') {
      this._container = window.document.getElementById(options.container)

      if (!this._container) {
        throw new Error(`Container '${options.container.toString()}' not found.`)
      }
    } else if (options.container instanceof window.HTMLElement) {
      this._container = options.container
    } else {
      throw new Error('Invalid type: \'container\' must be a String or HTMLElement.')
    }

    this._style = options.style
    this._adcode = options.adcode
    this._oldAdcode = void 0
    this._eventMap = new Set()
    this._mapGeoJsonBound = ref<AdcodeBoundaryGeoJson | undefined>(void 0)
    this._markers = []
    this._level = options.level || 1
    this.currentOffsetX = 0
    this.currentOffsetY = 0
    this._auxiliaryLine = options.auxiliaryLine || false
    this._boundBox = {
      show: options.boundBox?.show || false,
      style: options.boundBox?.style || {
        lineWidth: 2,
        stroke: '#000',
        fill: 'none',
        lineJoin: 'round'
      },
      level: options.boundBox?.level ? options.boundBox?.level : options.level ? options.level + 1 : 2
    }
    this._initializeSuccess = ref(false)
    this._init()
  }

  // 注册地图
  registerMap() {}

  _init(): void {
    this.transform = new Transform(this._container!, this._adcode)
    this._getAdcodeBoundary()
  }

  /**
   * 获得行政区划边界
   * */
  async _getAdcodeBoundary(): Promise<void> {
    this.group = new Group()
    const res = await getAdcodeBoundary(this._adcode.toString())
    const json = await res.json()
    this._mapGeoJsonBound.value = json
    this.transform && this.transform._getBounds(json)
    this._setupCanvas()
  }

  /**
   * 安装画布
   * */
  _setupCanvas(): void {
    const myZr = zrender.init(this._container)
    myZr.dom.style.background = '#eaeaea'
    this._zr = myZr
    this.coordinateAxisGroup = new Group()
    myZr.add(this.group)
    myZr.add(this.coordinateAxisGroup)
    storeAuthState(myZr, true)
    this._renderMap()
    initMapEvent({
      zr: myZr,
      root: this.group,
      scale: {
        minScale: 0.3,
        maxScale: 5
      },
      updateState: this._updateMapState.bind(this),
      isEnableDragging: true,
      isEnableScaling: true,
    }).roamable()
  }

  /**
   * 更新地图状态
   * @param state {{scale: number, offsetX: number, offsetY: number}}
   * */
  _updateMapState(state: {
    scale: number
    offsetX: number
    offsetY: number
  }): void {
    this._scale = state.scale
    this.currentOffsetY = state.offsetY
    this.currentOffsetX = state.offsetX
  }

  async _getGeoJsonFull() {
    if (!this._mapGeoJsonFull || this._oldAdcode !== this._adcode) {
      this.group.removeAll()
      this._oldAdcode = this._adcode
      this._mapGeoJsonFull = await getAdcodeGeoJson<AdcodeBoundaryGeoJson>(this._adcode)
      this._initializeSuccess.value = true
    }
  }

  async _renderMap(): Promise<void> {
    await this._getGeoJsonFull()
    this._mapGeoJsonFull && this._mapGeoJsonFull.features.forEach(feature => {
      feature.geometry.coordinates.forEach(coords => {
        if (Array.isArray(coords[0]) && coords[0].length > 2) {
          coords.forEach(coord => {
            if (feature.properties.name) {
              this._instantiateMap(feature, coord as number[])
            }
          })
        } else {
          if (feature.properties.name) {
            this._instantiateMap(feature, coords as number[])
          }
        }
      })
    })
    if (this._boundBox.show) {
      this._renderBoundBox()
    }
    if (this._auxiliaryLine) {
      const drawCoordinateAxis = new CoordinateAxis(
        this.group,
        this.coordinateAxisGroup,
        this._container!.offsetWidth,
        this._container!.offsetHeight
      )
      drawCoordinateAxis._drawCoordinateAxis(200)
    }
  }

  // 实例化 Map
  _instantiateMap(feature: Features, coord: number[]) {
    this._initializeSuccess.value = false
    const style = this._style || {
      fill: '#fff',
      stroke: '#ccc',
    }
    const Map = createPolygon({
      type: 'map',
      callback: (this.transform as Transform).calculateOffset.bind(this.transform, this._scale)
    })
    const map = new Map({
      // scaleX: this._adcode === 100000 ? 0.8 : 1,
      shape: {
        path: coord as number[]
      },
      style,
      zlevel: this._level
    })
    map.type = 'map'
    this.group && this.group.add(map)

    for (const type in MapEventType) {
      this.addEventListener(type.toLowerCase() as MapEventKey, map, feature)
    }
    this._initializeSuccess.value = true
  }

  // 绘制地图中心点
  _drawCenterPoint(): void {
    const Rect = this.group.getBoundingRect()

    // 地图中心点
    const center = {
      x: Rect.x + Rect.width / 2,
      y: Rect.y + Rect.height / 2
    }
    const circle = new Circle({
      shape: {
        cx: center.x,
        cy: center.y,
        r: 5
      },
      style: {
        fill: 'rgba(200,0,0,1)'
      },
      zlevel: 120
    })
    circle.on('click', (e: ElementEvent) => {
      console.log('center', e)
    })
    this.group.add(circle)
  }

  _renderBoundBox() {
    this._initializeSuccess.value = false
    if (!this._mapGeoJsonBound.value) return
    this._mapGeoJsonBound.value && this._mapGeoJsonBound.value.features.forEach(feature => {
      feature.geometry.coordinates.forEach(coords => {
        const BoundBox = createPolygon({
          type: 'boundBox',
          callback: (this.transform as Transform).calculateOffset.bind(this.transform, this._scale)
        })
        const boundBox = new BoundBox({
          shape: {
            path: coords[0] as number[]
          },
          style: this._boundBox.style,
          zlevel: this._boundBox.level
        })
        boundBox.type = 'boundBox'
        this.group && this.group.add(boundBox)
        this._initializeSuccess.value = true
      })
    })

    this._auxiliaryLine && this._drawCenterPoint()
  }

  addEventListener(type: MapEventKey, map: Path<PathProps>, feature: Features): void {
    map.on(type, (e: MapElementEvent) => {
      const {lng, lat} = this.transform.reverseCalculateOffset(
        this._scale,
        e.offsetX,
        e.offsetY,
        this.currentOffsetX,
        this.currentOffsetY
      )
      e.centroid = [lng, lat]
      this._eventMap.forEach((item) => {
        e.metadata = feature
        item[type] && item[type]!(e)
      })
    })
  }

  resize(): void {
    this.transform && this.transform.setContainerHeight(this._container!.offsetHeight)
    this.transform && this.transform.setContainerWidth(this._container!.offsetWidth)
    this.transform && this.transform._getBounds(this._mapGeoJsonBound.value)
    this._zr.resize({
      width: this._container!.offsetWidth,
      height: this._container!.offsetHeight
    })
    this.group.removeAll()
    this._renderMap()
    for (const marker of this._markers) {
      marker.update()
    }
  }

  addTooltip(callback: () => string | number, option?: AddTooltipOptions): void {
    const {top = 0, left = 0, offsetX = 0, offsetY = 0} = option
    let tooltip: HTMLDivElement = document.querySelector('.map-render-tooltip-wrapper')
    if (!tooltip) {
      tooltip = createElement('div', 'map-render-tooltip-wrapper', window.document.body)
    }
    const jsx = callback()
    tooltip.innerHTML = typeof jsx === 'number' ? jsx.toString() : jsx
    tooltip.style.transform = `translate(${left - tooltip.offsetWidth / 2 + offsetX}px, ${top - tooltip.offsetHeight - 20 + offsetY}px)`
    setTimeout(() => {
      tooltip.style.display = 'block'
    })
  }

  removeTooltip(hideWay?: 'remove' | 'hide'): void {
    const tooltip: HTMLDivElement = document.querySelector('.map-render-tooltip-wrapper')
    if (tooltip) {
      if (!hideWay || hideWay === 'remove') {
        document.body.removeChild(tooltip)
      } else {
        tooltip.style.display = 'none'
      }
    }
  }

  addMarker(...markers: Marker[]): void {
    // console.log('addMarker', markers)
    watch(() => this._mapGeoJsonBound.value, (val) => {
      if (val) {
        markers.forEach((marker) => {
          this._markers.push(marker)
          marker._createMarker(this.transform, this._scale, this._adcode, this.group)
        })
      }
    }, {deep: true, immediate: true})
  }

  async setAdcode(adcode: number): Promise<void> {
    this._adcode = adcode
    this._init()
  }

  setStyle(style: PathStyleProps): void {
    watch(() => this._initializeSuccess.value, (val) => {
      if (val) {
        this.group.children().forEach((item) => {
          if (item.type === 'map') {
            item.attr('style' as Parameters<typeof item.attr>[0], style as Parameters<typeof item.attr>[1])
          }
        })
      }
    }, {deep: true, immediate: true})
  }

  on(event: MapEventKey, listener: (event: MapElementEvent) => void): void {
    if (listener === undefined) {
      throw new Error('listener must be a function')
    }
    if (listener && typeof listener !== 'function') {
      throw new Error('listener must be a function')
    }
    if (event === 'resize') {
      this.resize()
    }

    this._eventMap.add({[event]: listener})
  }
}

export default Map
