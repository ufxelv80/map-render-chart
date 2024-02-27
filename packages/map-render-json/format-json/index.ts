import { jsonPath, rootPath } from './paths'
import { createDir, readDir, isDir } from './utils'
import { resolve } from 'node:path'
import {formatBoundJson} from "./format-bound-json";
import {formatFullJson} from "./format-full-json";
import {compactJson, unpack} from "./compact-json";

const formatLastDirs = ['full-json', 'bound-json']

function run () {
  // formatLastDirs.forEach(dir => {
  //   createDir(resolve(rootPath, 'src/' + dir))
  // })
  // formatFullJson()
  // formatBoundJson()
  compactJson()
  unpack()
}

run()