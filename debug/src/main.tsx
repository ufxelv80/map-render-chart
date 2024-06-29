// import { Map, Marker, Icon, Size, getCurrentMapName, LinearGradient, administrativeDivisionTree } from "map-render-chart"
import {Marker, Map, Icon, Size, LinearGradient, BezierCurveLine, getCurrentMapName, administrativeDivisionTree} from "../../packages/map-render-chart/src/index";
import '../../packages/map-render-chart/src/style/index.css'
import {MapData, MapElementEvent} from "map-render-chart/src/typing/Map";
import {staticResourcesURL} from "@/utils";
import axios from 'axios'
import type {AdministrativeAreaGeoJson, BoundGeoJson} from "map-render-chart";
import mapData from './data'

let adcode = 100000
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
    container: '#app',
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
    lineWidth: 2,
    lineJoin: 'round',

    // lineWidth: 4,
    shadowColor: 'rgba(27, 255, 255, 0.6)',
    shadowBlur: 10,
    shadowOffsetX: -2
  })

  ;['#00f'].forEach((color, index) => {
    map.addProjectionLayer({
      style: {
        fill: color,
        stroke: color,
        lineJoin: 'round',
      },
      offset: {
        x: index * 2 + 10,
        y: index * 5 + 10,
      },
      level: -index
    })
  })

  map.setMapBackground(staticResourcesURL('yn2.png'))
  // map.setMapBackground(staticResourcesURL('1.jpg'))
  const myIcon = new Icon({
    url: staticResourcesURL('logo.png'),
    size: new Size(15, 15)
  })

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
    const marker = new Marker({
      center: e.centroid,
      icon: myIcon,
    })
    map.addMarker(marker)
  })

  map.on('mousemove', (e: MapElementEvent) => {
    map.addTooltip(() => `<div style="color: #f00">${JSON.stringify(e.centroid)}</div>`, {
      top: e.offsetY,
      left: e.offsetX
    })
  })
  const marker = new Marker({
    center: [104.31578424963398, 25.20473382906296],
    geoType: 'geo',
    style: {
      fill: new LinearGradient(0, 0, 0, 1, [
        {offset: 0, color: '#f00'},
        {offset: 1, color: '#00f'}
      ], false)
    },
    size: new Size(25, 25),
    // icon: myIcon,
  })

  marker.on('click', function (e) {
    console.log(e)
  })


  const marker2 = new Marker({
    center: [98.28123874450952, 24.391253430087847],
    geoType: 'geo',
    icon: new Icon({
      url: staticResourcesURL('icon-4.png'),
      size: new Size(30, 30)
    }),
  })

  marker2.on('click', (e) => {
    console.log(e)
  })

  map.addMarker(marker, marker2)

  map.on('mouseout', () => {
    map.removeTooltip('hide')
  })

  map.setBackgroundColor('#ccc')

  map.addMapLabel({
    style: {
      fill: '#1BFFFF',
      fontSize: 12,
      fontFamily: '华文行楷',
    }
  }, (target) => {
    // console.log(target)
    if (target.abbreviation === '怒江') {
      target.setPosition(0, 10)
    }
    if (target.abbreviation === '迪庆') {
      target.setPosition(0, 5)
    }
    if (target.abbreviation === '临沧') {
      target.setPosition(0, 2)
    }
  })

  // map.hideMapName()

  // map.showMapName()

  const line = new BezierCurveLine({
    start: [
      86.70177002121382,
      39.792728457076834
    ],
    end: [
      115.05288290370268,
      23.87141383341314
    ],
    icon: staticResourcesURL('jiantou.png')
  })

  staticResourcesURL('jiantou.png')

  map.addBezierLine(line)

  const line2 = new BezierCurveLine({
    start: [
      116.1385030690304,
      40.17149496905742
    ],
    end: [
      115.05288290370268,
      23.87141383341314
    ],
    icon: staticResourcesURL('jiantou.png')
  })

  map.addBezierLine(line2)

  const line3 = new BezierCurveLine({
    start: [99.1982530124451, 27.482478946193265],
    end: [
      115.05288290370268,
      23.87141383341314
    ],
    icon: staticResourcesURL('jiantou.png')
  })

  map.addBezierLine(line3)

  const line4 = new BezierCurveLine({
    start: [
      85.0956724933881,
      32.25105310902561
    ],
    end: [
      115.05288290370268,
      23.87141383341314
    ],
    icon: staticResourcesURL('jiantou.png')
  })

  map.addBezierLine(line4)

  const line5 = new BezierCurveLine({
    start: [
      127.27319018063753,
      47.33440380512806
    ],
    end: [
      115.05288290370268,
      23.87141383341314
    ],
    icon: staticResourcesURL('jiantou.png')
  })

  map.addBezierLine(line5)

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
