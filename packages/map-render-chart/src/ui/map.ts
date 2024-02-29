import {
  AddTooltipOptions,
  BoundBoxOptions, MapBgOpt,
  MapElementEvent,
  MapEventKey,
  // MapElementEvent,
  MapEventType,
  MapOptions, MapProjectionLayerConfig
} from '../typing/Map'
import Transform from '../geo/transform'
import {AdministrativeAreaGeoJson, BoundGeoJson, Features} from '../typing/GeoJson'
import {createElement, createPolygon, forEachBoundGeoJson, storeAuthState} from '../util/util'
import * as zrender from 'zrender/lib/zrender'
import Group from "zrender/lib/graphic/Group";
import {ElementEvent, PathStyleProps, ZRenderType} from "zrender";
import Path, {PathProps} from "zrender/lib/graphic/Path";
import type Marker from "./marker";
import CoordinateAxis from "./coordinate-axis";
import Circle from "zrender/lib/graphic/shape/Circle";
import InitMapEvent from "./init-map-event";
import ZRImage from "zrender/lib/graphic/Image";

const defaultOptions: {
  zoom: number
  minZoom: number
  maxZoom: number
} = {
  zoom: 1,
  minZoom: 0.3,
  maxZoom: 5
}

class Map {
  private readonly _container: HTMLElement | null
  private transform: Transform | undefined;
  private _mapGeoJsonBound: BoundGeoJson | undefined;
  protected _mapGeoJsonFull: AdministrativeAreaGeoJson | undefined;
  public group: Group | undefined;
  private coordinateAxisGroup: Group | undefined;
  private _scale: number
  private _eventMap: Set<{ [key in MapEventKey]?: (params: MapElementEvent) => void }>;
  private _zr: ZRenderType;
  private readonly _markers: Marker[];
  private _style: PathStyleProps | undefined
  private _boundBox: BoundBoxOptions
  private readonly _level: number
  private currentOffsetX: number;
  private currentOffsetY: number;
  private readonly _auxiliaryLine: boolean;
  private mapMoveEvent: InitMapEvent | undefined
  private mapBg: string
  private mapBgOpt: MapBgOpt
  private _projectionLayerConfig: MapProjectionLayerConfig[] = []

  constructor(options: MapOptions) {
    options = Object.assign({}, defaultOptions, options)
    this._scale = options.zoom

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
    this._eventMap = new Set()
    this._mapGeoJsonBound = void 0
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
    this._setupCanvas()
    // this._init()
  }

  // 注册地图
  registerMap(geoJson: AdministrativeAreaGeoJson) {
    this.transform = new Transform(this._container!)
    this._mapGeoJsonBound = this.transform.getGeoJsonBounds(geoJson)
    this.transform._getBounds()
    this._mapGeoJsonFull = geoJson
    this._init()
  }

  _init(): void {
    this._renderMap()
    this.mapMoveEvent = new InitMapEvent({
      zr: this._zr,
      root: this.group,
      scale: {
        maxScale: 5,
        minScale: 0.3
      },
      zoom: this._scale,
      updateState: this._updateMapState.bind(this),
      isEnableDragging: false,
      isEnableScaling: false
    })
    this.mapMoveEvent.roamable()
    this._projectionLayerConfig.forEach((item) => {
      this._drawProjectionLayer(item)
    })
  }

  /**
   * 安装画布
   * */
  _setupCanvas(): void {
    const myZr = zrender.init(this._container)
    myZr.dom.style.background = '#eaeaea'
    this._zr = myZr
    this.coordinateAxisGroup = new Group()
    this.group = new Group()
    myZr.add(this.group)
    myZr.add(this.coordinateAxisGroup)
    storeAuthState(myZr, true)
  }

  /**
   * 设置地图缩放等级
   * */
  setMapZoom(opt: { minZoom: number, maxZoom: number }): void {
    this.mapMoveEvent.setMapZoom(opt)
  }

  enableScrollWheelZoom(status: boolean): void {
    this.mapMoveEvent.enableScrollWheelZoom(status)
  }

  /**
   * 启用鼠标拖拽
   * */
  enableDragging(status: boolean): void {
    this.mapMoveEvent.enableDragging(status)
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

  _renderMap() {
    this.group.removeAll()
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
            this._instantiateMap(feature, coords as unknown as number[])
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

  setMapBackground(image: string, opt: MapBgOpt = {height: 0, width: 0, x: 0, y: 0}) {
    if (!this._mapGeoJsonBound || !this._mapGeoJsonFull) {
      throw new Error('[MapRender] Map is not registrationComplete. 【registerMap】 method must be called before setting style')
    }
    this.mapBg = image
    this.mapBgOpt = opt
    this._initMapBackground()
  }
  _initMapBackground() {
    let BoundBox: ReturnType<typeof createPolygon>
    BoundBox = createPolygon({
      type: 'bg',
      callback: (this.transform as Transform).calculateOffset.bind(this.transform, this._scale)
    })
    let boundBox: Path<PathProps>

    const callback = (path: number[]) => {
      boundBox = new BoundBox({
        shape: {
          path: path
        }
      })
    }
    const pathArray = forEachBoundGeoJson(this._mapGeoJsonBound).sort((a, b) => b.length - a.length)
    callback(pathArray[0] as unknown as number[])
    const rect = this.group.getBoundingRect()
    const bg = new ZRImage({
      style: {
        image: this.mapBg,
        x: this.mapBgOpt.x || rect.x,
        y: this.mapBgOpt.y || rect.y,
        width: this.mapBgOpt.width || rect.width,
        height: this.mapBgOpt.height || rect.height
      },
      zlevel: 2
    })
    bg.getBoundingRect()
    bg.type = 'mapBg'
    bg.name = 'mapBg'
    bg.setClipPath(boundBox)
    this.group.add(bg)
  }

  // 实例化 Map
  _instantiateMap(feature: Features, coord: number[]) {
    const style = this._style || {
      fill: '#fff',
      stroke: '#ccc',
    }
    const Map = createPolygon({
      type: 'map',
      callback: (this.transform as Transform).calculateOffset.bind(this.transform, this._scale)
    })
    const map = new Map({
      shape: {
        path: coord as number[]
      },
      style,
      zlevel: this._level
    })
    map.type = 'map'
    map.name = 'map'
    this.group && this.group.add(map)

    for (const type in MapEventType) {
      this.addEventListener(type.toLowerCase() as MapEventKey, map, feature)
    }
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
    if (!this._mapGeoJsonBound) return

    this._mapAddLayer('boundBox', {
      shape: {
        path: [] as number[]
      },
      style: this._boundBox.style,
      zlevel: this._boundBox.level
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
    this.transform && this.transform._getBounds()
    this._zr.resize({
      width: this._container!.offsetWidth,
      height: this._container!.offsetHeight
    })
    this.group.removeAll()
    this._renderMap()
    this._initMapBackground()
    this._projectionLayerConfig.forEach((item) => {
      this._drawProjectionLayer(item)
    })
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
    markers.forEach((marker) => {
      this._markers.push(marker)
      marker._createMarker(this.transform, this._scale, this.group)
    })
  }

  /**
   * 添加投影层
   * */
  addProjectionLayer(opt: MapProjectionLayerConfig): void {
    this._projectionLayerConfig.push(opt)
    this._projectionLayerConfig.forEach((item) => {
      this._drawProjectionLayer(item)
    })
  }

  _drawProjectionLayer(opt: MapProjectionLayerConfig) {
    const pathOpt = {
      x: opt.offset.x,
      y: opt.offset.y,
      style: opt.style,
      zlevel: opt.level,
      shape: {
        path: [] as number[]
      }
    }
    this._mapAddLayer('projection', pathOpt)
  }

  _mapAddLayer(name: string, opt: PathProps & {shape: {path: number[]}}): void {
    const BoundBox = createPolygon({
      type: name,
      callback: (this.transform as Transform).calculateOffset.bind(this.transform, this._scale)
    })
    const pathArray = forEachBoundGeoJson(this._mapGeoJsonBound)
    pathArray.forEach((path) => {
      const poyPath = new BoundBox({
        ...opt,
        shape: {
          path: path as unknown as number[]
        }
      })
      poyPath.type = name
      poyPath.name = name
      this.group && this.group.add(poyPath)
    })
  }

  setGeoJson(geoJson: AdministrativeAreaGeoJson) {
    this.registerMap(geoJson)
  }

  setMapStyle(style: PathStyleProps): void {
    if (!this._mapGeoJsonBound || !this._mapGeoJsonFull) {
      throw new Error('[MapRender] Map is not registrationComplete. 【registerMap】 method must be called before setting style')
    }
    this._style = style
    this.group.children().forEach((item) => {
      if (item.type === 'map') {
        item.attr('style' as Parameters<typeof item.attr>[0], style as Parameters<typeof item.attr>[1])
      }
    })
  }

  setMapBoundBoxStyle(style: PathStyleProps): void {
    if (!this._mapGeoJsonBound || !this._mapGeoJsonFull) {
      throw new Error('[MapRender] Map is not registrationComplete. 【registerMap】 method must be called before setting style')
    }
    style.fill = 'none'
    this._boundBox.style = style
    this.group.eachChild((child) => {
      if (child.type === 'boundBox') {
        child.attr('style' as Parameters<typeof child.attr>[0], style as Parameters<typeof child.attr>[1])
      }
    })
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
