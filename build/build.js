const rollup = require('rollup')
const {rootPath, srcPath} = require('./paths')
const commander = require("commander");
const { createMap } = require("./config");
const { buildDTS } = require("./build-ts");
const chalk = require("chalk");
const fs = require("fs");
const transformDEV = require("./transform-dev");
const path = require("node:path");

function checkBundleCode(cfg) {
  // Make sure process.env.NODE_ENV is eliminated.
  for (let output of cfg.output) {
    let code = fs.readFileSync(output.file, {encoding: 'utf-8'});
    if (!code) {
      throw new Error(`${output.file} is empty`);
    }
    transformDEV.recheckDEV(code);
    console.log(chalk.green.dim('Check code: correct.'));
  }
}

async function build(configs) {
  console.log(chalk.yellow(`
    NOTICE: If you are using 'npm run build'. Run 'npm run prepublish' before build !!!
`));

  console.log(chalk.yellow(`
    NOTICE: If you are using syslink on zrender. Run 'npm run prepublish' in zrender first !!
`));

  for (let singleConfig of configs) {
    console.log(
      chalk.cyan.dim('\Bundling '),
      chalk.cyan(singleConfig.input)
    );

    console.time('rollup build--');
    const bundle = await rollup.rollup(singleConfig);

    for (let output of singleConfig.output) {
      console.log(
        chalk.green.dim('Created '),
        chalk.green(output.file),
        chalk.green.dim(' successfully.')
      );

      await bundle.write(output);

    };
    console.timeEnd('rollup build--');

    checkBundleCode(singleConfig);
  }
}
function run () {
  let descIndent = '';
  let egIndent = '';

  commander
    .usage('[options]')
    .description([
      'Build echarts and generate result files in directory `echarts/dist`.',
      '',
      '  For example:',
      '',
      egIndent + 'node build--/build--.js --prepublish'
      + '\n' + descIndent + '# Only prepublish.',
      egIndent + 'node build--/build--.js --type ""'
      + '\n' + descIndent + '# Only generate `dist/echarts.js`.',
      egIndent + 'node build--/build--.js --type common --min'
      + '\n' + descIndent + '# Only generate `dist/echarts.common.min.js`.',
      egIndent + 'node build--/build--.js --type simple --min'
      + '\n' + descIndent + '# Only generate `dist/echarts-en.simple.min.js`.',
    ].join('\n'))
    .option(
      '--prepublish',
      'Build all for release'
    )
    .option(
      '--min',
      'Whether to compress the output file, and remove error-log-print code.'
    )
    .option(
      '--type <type name>', [
        'Can be "simple" or "common" or "all" (default). Or can be simple,common,all to build-- multiple. For example,',
        descIndent + '`--type ""` or `--type "common"`.'
      ].join('\n'))
    .option(
      '--format <format>',
      'The format of output bundle. Can be "umd", "amd", "iife", "cjs", "esm".'
    )
    .parse(process.argv);

  let isPrePublish = !!commander.prepublish;
  let buildType = commander.type || 'all';
  let opt = {
    min: commander.min || true,
    format: ''
  };

  const format = commander?.format.split(',').map(a => a.trim());
  const cfgs = format.map(type =>
    createMap({
      ...opt,
      format: type
    })
  );
  build(cfgs).then(() => {
    // 检查dist目录下是否存在 style 文件夹，不存在则创建
    if (!fs.existsSync(path.resolve(rootPath, 'dist/style'))) {
      fs.mkdirSync(path.resolve(rootPath, 'dist/style'))
    }
    // 复制根目录下的css文件到dist目录下
    const files = fs.readdirSync(path.resolve(rootPath, 'src/style'))
    files.forEach(file => {
      const filePath = path.resolve(rootPath, 'src/style', file)
      const distPath = path.resolve(rootPath, 'dist/style', file)
      // console.log('filePath', filePath)
      // console.log('distPath', distPath)
      const fileData = fs.readFileSync(filePath, { encoding: 'utf-8' })
      // 去除 fileData 的所有空格
      const newFileData = fileData.replace(/\s*/g, '')
      fs.writeFileSync(distPath, newFileData, { encoding: 'utf-8' })
    })

    // 拷贝根目录下的 README.md 文件到 map-render-chart 目录下
    const readmePath = path.resolve(__dirname, '../README.md')
    const distReadmePath = path.resolve(__dirname, '../packages/map-render-chart/README.md')
    const readmeData = fs.readFileSync(readmePath, { encoding: 'utf-8' })
    fs.writeFileSync(distReadmePath, readmeData, { encoding: 'utf-8' })
  })
}
async function main () {
   await buildDTS()
  run()
}

main()