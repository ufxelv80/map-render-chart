import {createExportFile, readDir, readFile} from "./utils";
import {resolve} from "node:path";
import {jsonPath, rootPath} from "./paths";
import * as fs from "node:fs";

const createFileDir = resolve(rootPath, 'src/bound-json')

let importJson = ''

let exportJson = 'export {\n'

export function formatBoundJson() {
  const files = readDir(resolve(jsonPath, 'bounds'))
  files.forEach(file => {
    const field = file.split('_')[0]
    importJson += `import bound${field} from './${field}'\n`
    exportJson += `\tbound${field},\n`
    createBoundJsonFile(file, field)
  })
  createExportFile(resolve(createFileDir, 'export.ts'), importJson + exportJson + '}\n')
}

function createBoundJsonFile(fileName: string, field: string) {
  try {
    const fileHeaderContent = `import { BoundGeoJson } from '../typing/GeoJson'\n\n
  export default <BoundGeoJson>`
    const jsonData = readFile(resolve(jsonPath, 'bounds', fileName))
    fs.writeFileSync(resolve(createFileDir, field + '.ts'), fileHeaderContent + jsonData, 'utf-8')
  } catch (e) {
    console.error(e)
  }
}