import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bound.js',
      format: 'esm',
      sourcemap: false,
      plugins: [
      ]
    }
  ],
  plugins: [
    // 解析 ts
    typescript(),
    // 压缩文件
    terser()
  ]
}