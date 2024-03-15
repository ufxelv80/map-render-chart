import { Map, Marker, Icon, Size, getCurrentMapName, LinearGradient, administrativeDivisionTree } from "map-render-chart"
// import {Marker, Map, Icon, Size, LinearGradient, getCurrentMapName, administrativeDivisionTree} from "../../packages/map-render-chart/src/index";
import '../../packages/map-render-chart/src/style/index.css'
import {MapData, MapElementEvent} from "map-render-chart/src/typing/Map";
import {staticResourcesURL} from "@/utils";
import axios from 'axios'
import type {AdministrativeAreaGeoJson, BoundGeoJson} from "map-render-chart";
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

  map.registerMap(res[0].data as AdministrativeAreaGeoJson, adcode)

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
    lineWidth: 3,
    lineJoin: 'round',

    // lineWidth: 4,
    shadowColor: 'rgba(27, 255, 255, 0.6)',
    shadowBlur: 10,
    shadowOffsetX: -2
  })

  ;['#00f', '#0f0', '#f00'].forEach((color, index) => {
    map.addProjectionLayer({
      style: {
        fill: color,
        stroke: color,
        lineJoin: 'round',
      },
      offset: {
        x: index * 2 + 5,
        y: index * 5 + 5,
      },
      level: -index
    })
  })

  map.setMapBackground(staticResourcesURL('yn2.png'))
  // map.setMapBackground(staticResourcesURL('1.jpg'))

  map.on('click', async (e: MapElementEvent) => {
    console.log(e)
    // adcode = e.metadata.properties.adcode || e.metadata.properties.code
    // const res = await initJson()
    // map.setGeoJson(res[0].data as AdministrativeAreaGeoJson)
    // // map.setMapBackground(staticResourcesURL('1.jpg'))
    // map.setMapBackground(staticResourcesURL('yn2.png'))
    // map.setMapStyle({
    //   fill: 'rgba(0, 255, 0, 0.1)',
    //   stroke: 'red',
    //   lineWidth: 1,
    // })
  })

  map.on('mousemove', (e: MapElementEvent) => {
    map.addTooltip(() => `<div style="color: #f00">${JSON.stringify(e.centroid)}</div>`, {
      top: e.offsetY,
      left: e.offsetX
    })
  })
  const myIcon = new Icon({
    url: staticResourcesURL('logo.png'),
    size: new Size(15, 15)
  })
  const marker = new Marker({
    center: [101.57953199853587, 25.26389603989751],
    geoType: 'geo',
    style: {
      fill: new LinearGradient(0, 0, 0, 1, [
        {offset: 0, color: '#f00'},
        {offset: 1, color: '#00f'}
      ], false),
      stroke: '#f00',
      lineWidth: 1
    },
    size: new Size(25, 25),
    icon: myIcon,
  })

  marker.on('click', function (e) {
    console.log(e)
  })


  const marker2 = new Marker({
    center: [100.44601990222655, 25.123627034355763],
    geoType: 'geo',
    icon: new Icon({
      url: staticResourcesURL('icon-4.png'),
      size: new Size(30, 30)
    }),
  })

  marker2.on('click', (e) => {
    console.log(e)
  })

  map.addMarker(marker)

  map.on('mouseout', () => {
    map.removeTooltip('hide')
  })

  map.setBackgroundColor('#ccc')

  // map.addMapLabel({
  //   style: {
  //     fill: '#1BFFFF',
  //     fontSize: 13,
  //   }
  // }, (target) => {
  //   // console.log(target)
  //   if (target.abbreviation === '怒江') {
  //     target.setPosition(0, 10)
  //   }
  //   if (target.abbreviation === '迪庆') {
  //     target.setPosition(0, 5)
  //   }
  //   if (target.abbreviation === '临沧') {
  //     target.setPosition(0, 2)
  //   }
  // })

  // map.hideMapName()

  // map.showMapName()

  window.addEventListener('resize', () => {
    map.resize()
  })
  console.log(getCurrentMapName('云南'))
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