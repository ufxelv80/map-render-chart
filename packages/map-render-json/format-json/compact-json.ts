import { jsonPath } from "./paths";
import {resolve} from "node:path";
import {readFile} from "./utils";
import * as fs from 'node:fs'

import GeojsonMinifier from 'geojson-minifier'

const filePath = resolve(jsonPath, 'bounds/100000_bound.json')

export function compactJson () {
  const data = readFile(filePath)
  const json = JSON.parse(data)
  var minifier = new GeojsonMinifier({ precision: 6 });

  var packed = minifier.pack(json);
  fs.writeFileSync('json.json', packed, 'utf8')
}

export function unpack () {
  const minifier = new GeojsonMinifier({ precision: 6 });
  const packed = fs.readFileSync('json.json', 'utf8')
  const unpacked = minifier.unpack(JSON.parse(packed));
  console.log(unpacked)
}