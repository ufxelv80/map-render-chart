import {CustomText, LabelOptions} from "../typing";
import {Group, TextStyleProps} from "zrender";
import Text from 'zrender/lib/graphic/Text'
import type Transform from "../geo/transform";
import {AdministrativeAreaGeoJson} from "../typing";
import {MapNameFull} from "../typing";
import ZRText from "zrender/lib/graphic/Text";

class Label {
  // public label: string;
  // public abbreviation: string;
  public readonly geoJson: AdministrativeAreaGeoJson
  public group: Group
  public zrText: CustomText
  public readonly style: TextStyleProps
  public readonly transform: Transform
  public readonly mapFullName: MapNameFull[]
  public readonly _scale: number
  public abbreviation: string
  public textObjList: CustomText[] = []
  public readonly fullName: boolean
  public position: {
    x: number
    y: number
  }

  constructor(options: LabelOptions) {
    this.group = options.group;
    this.style = options.style;
    this.geoJson = options.geoJson
    this.transform = options.transform
    this.mapFullName = options.mapFullName
    this._scale = options.scale
    this.fullName = options.fullName
  }

  _renderText(callback: (target: Label) => void) {
    this.geoJson.features.forEach((feature) => {
      const currentMapName = this.mapFullName.find(item => item.adcode === feature.properties.adcode)
      const center = feature.properties.centroid || feature.properties.center
      const { x, y } = this.transform.calculateOffset(this._scale, center[0], center[1])
      this.position = {
        x,
        y
      }
      this.abbreviation = currentMapName ? currentMapName.abbreviation : feature.properties.name
      const textStyle = Object.assign({}, {x, y}, this.style)
      this.zrText = new Text({
        style: {
          text: this.fullName ? feature.properties.name : currentMapName ? currentMapName.abbreviation : feature.properties.name,
          ...textStyle
        },
        zlevel: 10
      }) as CustomText
      this.zrText.centroid = feature.properties.centroid
      this.zrText.type = 'label'
      this.zrText.name = this.abbreviation
      const rect = this.zrText.getBoundingRect()
      this.zrText.x = -rect.width / 2
      this.zrText.y = -rect.height
      this.group.add(this.zrText)
      this.textObjList.push(this.zrText)
      callback && callback(this)
    })
  }

  update (style: TextStyleProps) {
    this.zrText.attr('style', style)
  }

  resize() {
    this.textObjList.forEach(text => {
      const { x, y } = this.transform!.calculateOffset(this._scale, text.centroid[0], text.centroid[1])
      const currentText = text.style
      currentText.x = x
      currentText.y = y
      text.attr('style', currentText)
      this.group.add(text)
    })
  }

  public setPosition(x = this.zrText.x, y = this.zrText.y) {
    this.zrText.attr({x, y})
  }

  public setStyle(style: TextStyleProps) {
    this.zrText.attr('style', style)
  }
}

export default Label;
