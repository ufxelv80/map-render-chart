<template>
<div class="wrapper">
      <div class="chart-header">
        <p class="title">大屏标题</p>
      </div>
  <div ref="mapWrapperRef" class="map-wrapper"></div>
</div>
</template>

<script setup lang="tsx">
import { ref, nextTick } from 'vue'
import { Map } from '../../packages/map-render-chart/src/index'
import {AdministrativeAreaGeoJson} from "map-render-chart/src/typing/GeoJson";
import axios from "axios";
import Home from './Home.vue'

defineOptions({
  name: 'App'
})

const mapWrapperRef = ref<HTMLElement | null>(null)
let map: Map

axios.get('https://geo.datav.aliyun.com/areas_v3/bound/530000_full.json').then(res => {
  initMap(res.data)
})

function initMap (json: AdministrativeAreaGeoJson) {
  map = new Map({
    container: mapWrapperRef.value as HTMLElement,
    zoom: 0.8,
    level: 3
  })
  map.registerMap(json, '云南')

  map.on('mousemove', (e) => {
    console.log(e)
    map.addTooltip(() => `<div>1111</div>`, {
      offsetX: e.event.pageX,
      offsetY: e.event.pageY
    })
  })
}

window.addEventListener('resize', () => {
  nextTick(() => {
    map.resize()
  })
})
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .chart-header {
    width: 100%;
    height: 80px;
    background-color: #000;
    .title {
      color: #fff;
      font-size: 24px;
      text-align: center;
      line-height: 80px;
    }
  }
  .map-wrapper {
    width: 100%;
    height: calc(100% - 80px);
  }
}
</style>