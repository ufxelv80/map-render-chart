# mapRenderChart [![npm](https://img.shields.io/badge/npm-0.1.6-red)](https://www.npmjs.com/package/map-render-chart)

### 快速上手
#### 安装
```shell
npm install map-render-chart
or
yarn add map-render-chart
or
pnpm install map-render-chart
```

#### 使用
```javascript
import Map from 'map-render-chart';
const geoJson = {
  ...
}
const map = new Map({
  container: 'container'
});

map.registerMap(geoJson, '100000');
```

#### 通过 CDN 使用
```javascript
// 引入 map-render-chart
<script src="https://unpkg.com/map-render-chart@0.1.7/dist/index.global.js"></script>

<div id="container" style="width: 500px; height: 500px"></div>

const geoJson = {
  ...
}

const { Map } = mapRenderChart

function initMap () {
  map = new Map({
    container: 'map'
  })

  map.registerMap(geoJson, 100000)
}

initMap()
```

### 演示
[在线演示](https://codesandbox.io/p/devbox/p3j76k?file=%2Fsrc%2Findex.js%3A12%2C25)

<iframe src="https://p3j76k-1234.csb.app/" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" title="devbox"></iframe>

### Map 实例参数
<table>
    <thead>
        <tr>
            <th>参数名</th>
            <th>参数说明</th>
            <th>参数类型</th>
            <th>是否必要</th>
            <th>默认值</th>
        </tr>
    </thead>
<tbody>
    <tr>
        <td>container</td>
        <td>地图容器</td>
        <td>string | HTMLElement</td>
        <td>是</td>
        <td>-</td>
    </tr>
    <tr>
        <td>zoom</td>
        <td>地图初始等级</td>
        <td>number</td>
        <td>否</td>
        <td>0.8</td>
    </tr>
    <tr>
        <td>style</td>
        <td>地图初始样式</td>
        <td>PathStyleProps <a target="_blank" href='https://ecomfe.github.io/zrender-doc/public/api.html#zrenderdisplayable'>参考 zrender 文档</a></td>
        <td>否</td>
        <td>-</td>
    </tr>
    <tr>
        <td>boundBox</td>
        <td>地图边框属性</td>
        <td>BoundBoxOptions</td>
        <td>否</td>
        <td>-</td>
    </tr>
    <tr>
        <td>boundBox.show</td>
        <td>是否显示地图边框</td>
        <td>boolean</td>
        <td>是</td>
        <td>-</td>
    </tr>
    <tr>
        <td>boundBox.style</td>
        <td>地图初始样式</td>
        <td>PathStyleProps <a target="_blank" href='https://ecomfe.github.io/zrender-doc/public/api.html#zrenderdisplayable'>参考 zrender 文档</a></td>
        <td>否</td>
        <td>-</td>
    </tr>
    <tr>
        <td>boundBox.level</td>
        <td>地图初始样式</td>
        <td>number</td>
        <td>否</td>
        <td>1</td>
    </tr>
</tbody>
</table>

### Map 实例方法
<table>
    <thead>
        <tr>
            <th>方法名</th>
            <th>方法说明</th>
            <th>参数类型</th>
            <th>参数说明</th>
            <th>返回值</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>registerMap</td>
            <td>注册地图 <b style="color: #ff7676">(注: 此函数在其它所有函数之前调用)</b></td>
            <td>
                <ul>
                    <li>geoJson: object</li>
                    <li>mapName: string | number</li>
                </ul>
            </td><td>
                <ul>
                    <li>geoJson: (
                        <a target="_blank" href="https://datav.aliyun.com/portal/school/atlas/area_selector#&lat=31.769817845138945&lng=104.29901249999999&zoom=4">标准GeoJson格式</a>
                    )</li>
                    <li>mapName: 地图名称(当前所绘制地图的名称，如: 中国 | 100000)</li>
                </ul>
            </td>
            <td>void</td>
        </tr>
        <tr>
            <td>setMapZoom</td>
            <td>设置地图缩放等级</td>
            <td>
                <ul>
                    <li>opt: {
                        minZoom: number;
                        maxZoom: number;
                    }</li>
                </ul>
            </td>
            <td>
                <ul>
                    <li>opt: {
                        minZoom: 最小缩放等级;
                        maxZoom: 最大缩放等级;
                    }</li>
                </ul>
            </td>
            <td>void</td>
        </tr>
        <tr>
            <td>enableScrollWheelZoom</td>
            <td>是否启用鼠标滚轮缩放功能</td>
            <td>
                <ul>
                    <li>status: boolean</li>
                </ul>
            </td>
            <td>
                <ul>
                    <li>true: 启用</li>
                    <li>false: 关闭</li>
                </ul>
            </td>
            <td>void</td>
        </tr>
        <tr>
            <td>enableDragging</td>
            <td>是否启用拖拽功能</td>
            <td>
                <ul>
                    <li>status: boolean</li>
                </ul>
            </td>
            <td>
                <ul>
                    <li>true: 启用</li>
                    <li>false: 关闭</li>
                </ul>
            </td>
            <td>void</td>
        </tr>
        <tr>
            <td>setMapBackground</td>
            <td>设置地图背景图片</td>
            <td>
                <ul>
                    <li>image: string</li>
                    <li>opt: object</li>
                </ul>
            </td>
            <td>
                <ul>
                    <li>image: 图片url(必传)</li>
                    <li>opt: {width: 图片宽度，height: 图片高度. x: 图片起始x位置, y: 图片起始y位置} (可选)</li>
                </ul>
            </td>
            <td>void</td>
        </tr>
</tbody>
</table>