import {throwError} from "./util";
import {MapNameFull} from "../typing/Map";

export const mapName: MapNameFull[] = [
  {
    adcode: 110000,
    name: '北京市',
    abbreviation: '北京',
    children: [
      {
        adcode: 110100,
        name: '北京市',
        abbreviation: '北京',
        children: [
          {
            adcode: 110101,
            name: '东城区',
            abbreviation: '东城'
          }
        ]
      }
    ]
  },
  {
    adcode: 530000,
    name: '云南省',
    abbreviation: '云南',
    children: [
      {
        adcode: 530100,
        name: '昆明市',
        abbreviation: '昆明',
      },
      {
        adcode: 530300,
        name: '曲靖市',
        abbreviation: '曲靖',
      },
      {
        adcode: 530400,
        name: '玉溪市',
        abbreviation: '玉溪',
      },
      {
        adcode: 530500,
        name: '保山市',
        abbreviation: '保山',
      },
      {
        adcode: 530600,
        name: '昭通市',
        abbreviation: '昭通',
      },
      {
        adcode: 530700,
        name: '丽江市',
        abbreviation: '丽江',
      },
      {
        adcode: 530800,
        name: '普洱市',
        abbreviation: '普洱',
      },
      {
        adcode: 530900,
        name: '临沧市',
        abbreviation: '临沧',
      },
      {
        adcode: 532300,
        name: '楚雄彝族自治州',
        abbreviation: '楚雄',
      },
      {
        adcode: 532500,
        name: '红河哈尼族彝族自治州',
        abbreviation: '红河',
      },
      {
        adcode: 532600,
        name: '文山壮族苗族自治州',
        abbreviation: '文山',
      },
      {
        adcode: 532800,
        name: '西双版纳傣族自治州',
        abbreviation: '西双版纳',
        abbreviation2: '版纳',
      },
      {
        adcode: 532900,
        name: '大理白族自治州',
        abbreviation: '大理',
      },
      {
        adcode: 533100,
        name: '德宏傣族景颇族自治州',
        abbreviation: '德宏',
      },
      {
        adcode: 533300,
        name: '怒江傈僳族自治州',
        abbreviation: '怒江',
      },
      {
        adcode: 533400,
        name: '迪庆藏族自治州',
        abbreviation: '迪庆',
      }
    ]
  }
]

export function getCurrentMapName (adcode?: number) {
  if (!adcode) return mapName
  const province = mapName.find(item => item.adcode === adcode)
  if (!province) {
    throwError('adcode not found')
  }
  return province.children
}