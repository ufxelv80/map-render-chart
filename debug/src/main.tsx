import { Map, Marker, Icon, Size } from "map-render-chart"
// import {Marker, Map, Icon, Size} from "../../src";
import 'map-render-chart/src/style/map-render-gl.css'
import {MapElementEvent} from "map-render-chart/src/typing/Map";
import {staticResourcesURL} from "@/utils";

async function initMap() {
  const map = new Map({
    container: 'app',
    adcode: 530000,
    scale: 0.8,
    style: {
      fill: '#ccc',
      stroke: '#999',
      lineWidth: 1,
      lineJoin: 'round'
    },
    boundBox: {
      show: true,
      level: 3
    }
  })

  map.on('click', (e: MapElementEvent) => {
    console.log(e)
    // map.setAdcode(e.target.properties.adcode || e.target.properties.code)
    // map.setStyle({
    //   fill: 'rgba(0, 255, 0, 0.1)',
    //   stroke: 'red',
    //   lineWidth: 1,
    // })
  })

  map.on('mousemove', (e: MapElementEvent) => {
    map.addTooltip(() => {
      return `<div class='wrapper'>
      <span>${ e.centroid }</span>
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
    center: [103.40017334168972, 26.689930207284007],
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
}

initMap()