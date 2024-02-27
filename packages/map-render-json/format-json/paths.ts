import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// @ts-ignore
const dir = dirname(fileURLToPath(import.meta.url))

export const rootPath = resolve(dir, '..')

export const jsonPath = resolve(rootPath, 'geoJson')