import camelCase from 'lodash/camelCase'

import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import commonJs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import postCss from 'rollup-plugin-postcss'
import babili from 'rollup-plugin-babili'
import postcssModules from 'postcss-modules'
import cssNext from 'postcss-cssnext'
import autoprefixer from 'autoprefixer'
import cssNano from 'cssnano'

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
          },
        }),
        cssNext({warnForDuplicates: false}),
        autoprefixer(),
        cssNano(),
      ],
      getExport(id) {
        return cssExportMap[id]
      },
      extensions: ['.css'],
    }),
    json({
      preferConst: true,
    }),
    babel({
      babelrc: false,
      presets: ['react'],
      exclude: 'node_modules/**',
    }),
    babili({
      comments: false,
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