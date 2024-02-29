export type Coordinates = number[][][][] | number[][][]
export interface Features {
  type: string
  properties: {
    code: number
    "adcode": number
    "name": string
    "center": number[]
    "centroid": number[]
    "childrenNum": 0,
    "level": string
    "parent"?: {
      "adcode": number
    },
    "subFeatureIndex"?: number
    "acroutes"?: number[]
    filename?: string
    fullname?: string
    bbox?: number[][]
    offset?: number[]
  }
  geometry: {
    type: string
    coordinates: Coordinates
  }
}

export interface AdcodeBoundaryGeoJson {
  features: Features[]
}
export interface BoundGeoJson {
  type: string
  features: Features[]
  propertity?: {
    code: number
  }
}

export interface AdministrativeAreaGeoJson {
  type: string
  features: Features[]
}
