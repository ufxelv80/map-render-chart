const assert = require("assert")
const nodePath = require("path")
const fs = require("fs")
const {rootPath} = require("./paths")
const chalk = require("chalk")
const ts = require('typescript');
const fsExtra = require("fs-extra");
const globby = require("globby");

const tsConfig = readTSConfig();

const tmpDir = nodePath.resolve(rootPath, 'pre-publish-tmp');

const mainSrcGlobby = {
  patterns: [
    'src/**/*.ts'
  ],
  cwd: rootPath
};
const extensionSrcGlobby = {
  patterns: [
    'extension-src/**/*.ts'
  ],
  cwd: rootPath
};
const extensionSrcDir = nodePath.resolve(rootPath, 'extension-src');
const extensionESMDir = nodePath.resolve(rootPath, 'extension');

const typesDir = nodePath.resolve(rootPath, 'types');
const esmDir = 'lib';

const compileWorkList = [
  {
    logLabel: 'main ts -> js-esm',
    compilerOptionsOverride: {
      module: 'ES2015',
      rootDir: rootPath,
      outDir: tmpDir,
      // Generate typing when buidling esm
      declaration: true,
      declarationDir: typesDir
    },
    srcGlobby: mainSrcGlobby,
    transformOptions: {
      filesGlobby: {patterns: ['**/*.js'], cwd: tmpDir},
      transformDEV: true
    },
    before: async function () {
      fsExtra.removeSync(tmpDir);
      fsExtra.removeSync(nodePath.resolve(rootPath, 'types'));
      fsExtra.removeSync(nodePath.resolve(rootPath, esmDir));
      fsExtra.removeSync(nodePath.resolve(rootPath, 'index.ts'));
      fsExtra.removeSync(nodePath.resolve(rootPath, 'index.blank.js'));
      fsExtra.removeSync(nodePath.resolve(rootPath, 'index.common.js'));
      fsExtra.removeSync(nodePath.resolve(rootPath, 'index.simple.js'));
    },
    after: async function () {
      fs.renameSync(nodePath.resolve(tmpDir, 'src/index.ts'), nodePath.resolve(rootPath, 'index.ts'));
    }
  },
  {
    logLabel: 'extension ts -> js-esm',
    compilerOptionsOverride: {
      module: 'ES2015',
      declaration: false,
      rootDir: extensionSrcDir,
      outDir: extensionESMDir
    },
    srcGlobby: extensionSrcGlobby,
    transformOptions: {
      filesGlobby: {patterns: ['**/*.js'], cwd: extensionESMDir},
      transformDEV: true
    },
    before: async function () {
      fsExtra.removeSync(extensionESMDir);
    },
    after: async function () {
      // await transformLibFiles(extensionESMDir, 'lib');
    }
  }
];

async function buildDTS () {
  for (let {
    logLabel, compilerOptionsOverride, srcGlobby,
    transformOptions, before, after
  } of compileWorkList) {
    process.stdout.write(chalk.green.dim(`[${logLabel}]: compiling ...`));

    before && await before();

    let srcPathList = await readFilePaths(srcGlobby);

    await tsCompile(compilerOptionsOverride, srcPathList);
  }
}

async function readFilePaths({patterns, cwd}) {
  assert(patterns && cwd);
  return (
    await globby(patterns, {cwd})
  ).map(
    srcPath => nodePath.resolve(cwd, srcPath)
  );
}

function readTSConfig() {
  // tsconfig.json may have comment string, which is invalid if
  // using `require('tsconfig.json'). So we use a loose parser.
  let filePath = nodePath.resolve(rootPath, 'tsconfig.json');
  const tsConfigText = fs.readFileSync(filePath, {encoding: 'utf8'});
  return (new Function(`return ( ${tsConfigText} )`))();
}

async function tsCompile(compilerOptionsOverride, srcPathList) {
  assert(
    compilerOptionsOverride
    && compilerOptionsOverride.module
    && compilerOptionsOverride.rootDir
    && compilerOptionsOverride.outDir
  );

  let compilerOptions = {
    ...tsConfig.compilerOptions,
    ...compilerOptionsOverride,
    sourceMap: false
  };

  runTsCompile(ts, compilerOptions, srcPathList);
}

async function runTsCompile(localTs, compilerOptions, srcPathList) {
  // Must do it. becuase the value in tsconfig.json might be different from the inner representation.
  // For example: moduleResolution: "NODE" => moduleResolution: 2
  const {options, errors} = localTs.convertCompilerOptionsFromJson(compilerOptions, rootPath);

  if (errors.length) {
    let errMsg = 'tsconfig parse failed: '
      + errors.map(error => error.messageText).join('. ')
      + '\n compilerOptions: \n' + JSON.stringify(compilerOptions, null, 4);
    assert(false, errMsg);
  }

  // See: https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API

  let program = localTs.createProgram(srcPathList, options);
  let emitResult = program.emit();

  let allDiagnostics = localTs
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      let message = localTs.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(chalk.red(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`));
    }
    else {
      console.log(chalk.red(localTs.flattenDiagnosticMessageText(diagnostic.messageText, '\n')));
    }
  });
  if (allDiagnostics.length > 0) {
    throw new Error('TypeScript Compile Failed')
  }
}

module.exports = {
  buildDTS
}