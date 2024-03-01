// import { Map, Marker, Icon, Size } from "map-render-chart"
import {Marker, Map, Icon, Size} from "../../packages/map-render-chart/src/index";
import '../../packages/map-render-chart/src/style/index.css'
import {MapData, MapElementEvent} from "map-render-chart/src/typing/Map";
import {staticResourcesURL} from "@/utils";
import axios from 'axios'
import {AdministrativeAreaGeoJson, BoundGeoJson} from "map-render-chart/src/typing/GeoJson";
import mapData from './data'

let adcode = 530000

function getFullJsonData() {
  return axios.get('https://geo.datav.aliyun.com/areas_v3/bound/' + adcode + '_full.json')
}

function getBoundJsonData() {
  // return axios.get('http://localhost:8700/json/bounds/' + adcode + '_bound.json')
}

async function initJson() {
  return await Promise.all([getFullJsonData()])
}

async function initMap() {
  const res = await initJson()

  const map = new Map({
    container: 'app',
    zoom: 0.8,
    level: 3,
    boundBox: {
      show: true,
      level: 3
    }
  })

  map.registerMap(res[0].data as AdministrativeAreaGeoJson)

  map.setMapZoom({
    minZoom: 0.1,
    maxZoom: 10
  })

  map.enableScrollWheelZoom(true)
  map.enableDragging(true)

  map.setMapStyle({
    fill: 'rgba(0, 0, 0, 0)',
    stroke: '#999',
    lineWidth: 1,
    lineJoin: 'round'
  })

  map.setMapBoundBoxStyle({
    stroke: '#1BFFFF',
    lineWidth: 3
  })

  ;['#00f', '#0f0', '#f00'].forEach((color, index) => {
    map.addProjectionLayer({
      style: {
        fill: color,
        stroke: color,
        lineJoin: 'round',
      },
      offset: {
        x: index * 5 + 10,
        y: index * 2 + 5,
      },
      level: -index
    })
  })

  map.setMapBackground(staticResourcesURL('yn2.png'))
  // map.setMapBackground(staticResourcesURL('1.jpg'))

  map.on('click', async (e: MapElementEvent) => {
    console.log(e)
    adcode = e.metadata.properties.adcode || e.metadata.properties.code
    const res = await initJson()
    map.setGeoJson(res[0].data as AdministrativeAreaGeoJson)
    // map.setMapBackground(staticResourcesURL('1.jpg'))
    map.setMapBackground(staticResourcesURL('yn2.png'))
    // map.setMapStyle({
    //   fill: 'rgba(0, 255, 0, 0.1)',
    //   stroke: 'red',
    //   lineWidth: 1,
    // })
  })

  map.on('mousemove', (e: MapElementEvent) => {
    map.addTooltip(() => {
      return `<div class='wrapper' style="color: #ff0">
      <span>${e.metadata.properties.name} - ${ e.metadata.properties.adcode }</span>
    </div>`
    }, {
      top: e.offsetY,
      left: e.offsetX
    })
  })
  const myIcon = new Icon({
    url: staticResourcesURL('logo.png'),
    size: new Size(15, 15)
  })
  const marker = new Marker({
    center: [100.2864007892954, 22.792575054878046],
    geoType: 'geo',
    icon: myIcon,
  })


  const marker2 = new Marker({
    center: [103.04048186924119, 24.955322622628728],
    geoType: 'geo',
    icon: myIcon,
  })

  map.addMarker(marker, marker2)

  map.on('mouseout', () => {
    map.removeTooltip('hide')
  })

  window.addEventListener('resize', () => {
    map.resize()
  })
  // handleMapData(map)
}

// 处理地图数据
function handleMapData(map: Map) {
  const data: MapData[] = []
  const mapFullName = map.getMapNameAbbr()!
  mapData.forEach((item) => {
    const currentName = mapFullName.find((name) => (name.abbreviation === item.label || name.abbreviation2 === item.label))
    if (currentName) {
      data.push({
        name: currentName.name,
        value: item.value,
        children: item.children
      })
    }
  })
  map.setMapData(data, ['#b5a7f8', '#7734c0'])
}

initMap()