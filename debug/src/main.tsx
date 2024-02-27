import { Map, Marker, Icon, Size } from "map-render-chart"
// import {Marker, Map, Icon, Size} from "../../src";
import '../../packages/map-render-chart/src/style/index.css'
import {MapElementEvent} from "map-render-chart/src/typing/Map";
import {staticResourcesURL} from "@/utils";
import * as echarts from 'echarts'

// 使用更高的量化精度
const precision = 1000000;

function encodeCoordinates(coords) {
  let encoded = coords.map((cur, index) => {
    // 直接将坐标转换为整数
    return [Math.floor(cur[0] * precision), Math.floor(cur[1] * precision)];
  });

  // 计算差分值
  let diffs = encoded.map((cur, index) => {
    if (index === 0) {
      return cur; // 第一个坐标不变
    } else {
      let prev = encoded[index - 1];
      return [cur[0] - prev[0], cur[1] - prev[1]];
    }
  });

  // 转换差分值为字符串
  return diffs.map(pair => pair.map(n => n.toString(36)).join(",")).join(" ");
}

function decodeCoordinates(encoded) {
  let diffs = encoded.split(" ").map(e => e.split(",").map(c => parseInt(c, 36)));
  let coords = [];

  for (let i = 0; i < diffs.length; i++) {
    if (i === 0) {
      // 第一个坐标直接添加
      coords.push([diffs[i][0] / precision, diffs[i][1] / precision]);
    } else {
      // 后续坐标加上前一个坐标的值
      let last = coords[i - 1];
      coords.push([(last[0] * precision + diffs[i][0]) / precision, (last[1] * precision + diffs[i][1]) / precision]);
    }
  }

  return coords;
}

// 示例使用
const originalCoords = [
  [99.98525872289973, 26.04490937195122],
  [114.502501, 38.045501],
  [99.98525872289973, 26.04490937195122]
];

const encoded = encodeCoordinates(originalCoords);
console.log("Encoded:", encoded);

const decoded = decodeCoordinates(encoded);
console.log("Decoded:", decoded);




async function initMap() {
  var mapFeatures = echarts.getMap('云南')
  console.log(mapFeatures)
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