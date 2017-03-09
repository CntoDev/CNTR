import commonJs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

export default {
  entry: 'src/index.js',
  format: 'umd',
  dest: 'build/ocap.js',
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
    }),
    commonJs({
      include: 'node_modules/**',
      extensions: [ '.js' ],
      ignoreGlobal: false,
      sourceMap: false,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    })
  ],
};