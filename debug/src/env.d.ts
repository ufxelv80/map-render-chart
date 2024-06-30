declare module '*.pbf' {
  const data: {
    type: string
    data: Buffer
  }
  export default data
}
