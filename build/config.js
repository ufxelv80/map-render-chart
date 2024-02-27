const nodePath = require("path");
const {rootPath} = require("./paths");
const nodeResolvePlugin = require("@rollup/plugin-node-resolve").default;
const replace = require("@rollup/plugin-replace");
const {terser} = require("rollup-plugin-terser");
const MagicString = require("magic-string");

function createOutputs(basename, { min }, commonOutputOpts) {
  commonOutputOpts = {
    format: 'umd',
    ...commonOutputOpts
  }
  function createReplacePlugin(replacement) {
    const plugin = replace({
      'process.env.NODE_ENV': JSON.stringify(replacement)
    });
    // Remove transform hook. It will have warning when using in output
    delete plugin.transform;
    return plugin;
  }
  const output = [{
    ...commonOutputOpts,
    // Disable sourcemap in
    sourcemap: false,
    plugins: [
      createReplacePlugin('development')
      // createAddLicensePlugin(true)
    ],
    file: basename + '.js'
  }];

  if (min) {
    output.push({
      ...commonOutputOpts,
      // Disable sourcemap in min file.
      sourcemap: false,
      // TODO preamble
      plugins: [
        createReplacePlugin('production'),
        terser()
        // createAddLicensePlugin(false)
      ],
      file: basename + '.min.js'
    })
  }
  return output;
}

function createMap (opt = {}) {
  const format = opt.format || 'umd';
  const input = nodePath.resolve(rootPath, `pre-publish-tmp/src/index.js`);
  const fileFix = format === 'iife' ? '.global' : '';

  return {
    plugins: [
      nodeResolvePlugin()
    ],
    treeshake: {
      moduleSideEffects: false
    },

    input: input,

    output: createOutputs(
      nodePath.resolve(rootPath, `dist/index${fileFix}`),
      opt,
      {
        name: 'mapRenderGL',
        // Ignore default exports, which is only for compitable code like:
        // import echarts from 'echarts/lib/echarts';
        exports: 'named',
        format: opt.format
      }
    )
  };
}

module.exports = {
  createMap,
}