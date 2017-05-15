import camelCase from 'lodash/camelCase'

import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import commonJs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import postCss from 'rollup-plugin-postcss'
import postcssModules from 'postcss-modules'
import cssNext from 'postcss-cssnext'
const cssExportMap = {}

export default {
  entry: 'src/index.js',
  format: 'umd',
  dest: 'build/index.js',
  plugins: [
    postCss({
      plugins: [
        postcssModules({
          generateScopedName(name, filename) {
            const fileName = filename.match(/([\w_-]+)\.[\w_-]+$/)[1]
            return camelCase(fileName) + '-' + name
          },
          getJSON(id, exportTokens) {
            cssExportMap[id] = exportTokens
          }
        }),
        cssNext({warnForDuplicates: false}),
      ],
      getExport(id) {
        return cssExportMap[id]
      },
      extensions: ['.css'],
    }),
    json({
      preferConst: true, // Default: false
    }),
    babel({
      babelrc: false,
      presets: ['react'],
      exclude: 'node_modules/**',
    }),
    nodeResolve({
      jsnext: true,
      main: true,
    }),
    commonJs({
      include: 'node_modules/**',
      extensions: ['.js'],
      ignoreGlobal: false,
      sourceMap: false,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
}