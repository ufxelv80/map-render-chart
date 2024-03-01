import {CustomText, LabelOptions} from "../typing/Label";
import {Group, TextStyleProps} from "zrender";
import Text from 'zrender/lib/graphic/Text'
import type Transform from "../geo/transform";
import {AdministrativeAreaGeoJson} from "../typing/GeoJson";
import {MapNameFull} from "../typing/Map";
import ZRText from "zrender/lib/graphic/Text";

class Label {
  // public label: string;
  // public abbreviation: string;
  private readonly geoJson: AdministrativeAreaGeoJson
  private group: Group
  private zrText: CustomText
  private readonly style: TextStyleProps
  private readonly transform: Transform
  private readonly mapFullName: MapNameFull[]
  private readonly _scale: number
  public abbreviation: string
  private textObjList: CustomText[] = []
  private readonly fullName: boolean

  constructor(options: LabelOptions) {
    this.group = options.group;
    this.style = options.style;
    this.geoJson = options.geoJson
    this.transform = options.transform
    this.mapFullName = options.mapFullName
    this._scale = options.scale
    this.fullName = options.fullName
  }

  renderText(callback: (target: Label) => void) {
    this.geoJson.features.forEach((feature) => {
      const currentMapName = this.mapFullName.find(item => item.adcode === feature.properties.adcode)
      const { x, y } = this.transform!.calculateOffset(this._scale, feature.properties.centroid[0], feature.properties.centroid[1])
      this.abbreviation = currentMapName.abbreviation
      const textStyle = Object.assign({}, {x, y}, this.style)
      this.zrText = new Text({
        style: {
          text: this.fullName ? currentMapName.name : currentMapName.abbreviation,
          ...textStyle
        },
        zlevel: 10
      }) as CustomText
      this.zrText.centroid = feature.properties.centroid
      this.zrText.type = 'label'
      this.zrText.name = currentMapName.name
      const rect = this.zrText.getBoundingRect()
      this.zrText.x = -rect.width / 2
      this.zrText.y = -rect.height
      this.group.add(this.zrText)
      this.textObjList.push(this.zrText)
      callback(this)
    })
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