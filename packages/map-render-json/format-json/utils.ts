import * as fs from 'node:fs'

// 判断路劲是否存在
export function isExist (filePath: string) {
  return fs.existsSync(filePath)
}
export function createDir (dirPath: string) {
  // 判断文件夹是否存在，不存在则创建，如果存在则不做操作
  if (!isExist(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// 读取目录中的所有文件
export function readDir (filePath: string) {
  if (!isExist(filePath)) {
    throw new Error('文件不存在')
  }
  return fs.readdirSync(filePath)
}

// 判断是文件夹还是文件
export function isDir (filePath: string) {
  if (!isExist(filePath)) {
    throw new Error('文件不存在')
  }
  return fs.statSync(filePath).isDirectory()
}

// 读取文件内容
export function readFile (filePath: string) {
  if (!isExist(filePath)) {
    throw new Error('文件不存在')
  }
  return fs.readFileSync(filePath, 'utf-8')
}

// 创建导出文件
export function createExportFile (filePath: string, content: string) {
  fs.writeFileSync(filePath, content, 'utf-8')
}