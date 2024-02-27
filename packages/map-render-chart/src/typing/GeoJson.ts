export interface Features {
  geometry: {
    coordinates: number[][][] | number[][]
  }
  properties: {
    adcode: number
    name: string
    center: number[]
    code: number
  }
  type: string
}

export interface BoundGeoJson {
  type: string
  features: {
    type: string
    geometry: {
      coordinates: number[][][] | number[][]
      type: string
    },
    properties: any
  }[]
}

export interface AdcodeBoundaryGeoJson {
  features: Features[]
}
