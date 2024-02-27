export interface BoundGeoJson {
  type: string
  features: {
    type: string
    geometry: {
      coordinates: number[][][][] | number[][][]
      type: string
    },
    properties: {
      "adcode": number
      "name": string
      "center": number[]
      "centroid": number[]
      "childrenNum": number
      "level": string
      "acroutes": number[],
      "parent": {"adcode": number | null}
    }
  }[]
}

export interface AdministrativeAreaGeoJson {
  type: string
  features: {
    type: string
    properties: {
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
      coordinates: number[][][] | number[][][][]
    }
  }[]
}