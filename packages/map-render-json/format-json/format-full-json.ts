import {resolve} from "node:path";
import {jsonPath, rootPath} from "./paths";
import {createExportFile, readDir, readFile} from "./utils";
import * as fs from "node:fs";

const createFileDir = resolve(rootPath, 'src/full-json')

let importJson = ''

let exportJson = 'export {\n'
export function formatFullJson () {
  const files = readDir(resolve(jsonPath, 'fulls'))
  files.forEach(file => {
    const field = file.split('_')[0]
    importJson += `import full${field} from './${field}'\n`
    exportJson += `\tfull${field},\n`
    createFullJsonFile(file, field)
  })
  createExportFile(resolve(createFileDir, 'export.ts'), importJson + exportJson + '}\n')
}

function createFullJsonFile(fileName: string, field: string) {
  try {
    const fileHeaderContent = `import { AdministrativeAreaGeoJson } from '../typing/GeoJson'\n\n
  export default <AdministrativeAreaGeoJson>`
    const jsonData = readFile(resolve(jsonPath, 'fulls', fileName))
    fs.writeFileSync(resolve(createFileDir, field + '.ts'), fileHeaderContent + jsonData, 'utf-8')
  } catch (e) {
    console.error(e)
  }
}