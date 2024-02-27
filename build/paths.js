const path = require('path');

const rootPath = path.resolve(__dirname, '../packages/map-render-chart')

const srcPath = path.resolve(rootPath, 'src');

module.exports = {
  rootPath,
  srcPath
}