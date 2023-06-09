import terser from '@rollup/plugin-terser';
export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/bundle.js',
      format: 'es'
    },
    {
      file: 'dist/bundle.min.js',
      format: 'iife',
      name: 'AliyunTtsWebSocket',
      plugins: [terser({
        ecma: 5
      })]
    }
  ]
}
