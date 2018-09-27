const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const nodeExternals = require('webpack-node-externals')
const merge = require('webpack-merge')

const TARGET_NODE = process.env.WEBPACK_TARGET === 'node'
const target = TARGET_NODE ? 'server' : 'client'

module.exports = {
  configureWebpack: () => ({
    // 将entry指向应用程序的server/client entry文件
    entry: `./src/entry-${target}.js`,
    // 这允许webpack以node适用方式处理动态导入
    // 并且还会在编译Vue组件时
    // 告知 `vue-loader` 输送面向服务器代码
    target: TARGET_NODE ? 'node' : 'web',
    node: TARGET_NODE ? undefined : false,
    // 对bundle renderer提供source map支持
    devtool: 'source-map',
    // 此处告知server bundle使用node风格导出模块
    output: {
      libraryTarget: TARGET_NODE ? 'commonjs2' : undefined
    },
    // 外置化应用程序依赖模块，可以使服务器构建速度更快
    // 并生成较小的bundle文件
    externals: TARGET_NODE ? nodeExternals({ whitelist: [/\.css$/] }) : undefined,
    optimization: {
      splitChunks: undefined
    },
    // 服务端渲染时，这是将服务器的整个输出构建为单个JSON文件的插件，默认文件名为 `vue-ssr-server-bundle.json`
    // 客户端选老师，整个输出构建为单个JSON文件，默认文件名为 `vue-ssr-client-manifest.json`
    plugins: [TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin()]
  }),
  chainWebpack: config => {
    config.module.rule('vue').use('vue-loader').tap(options => {
      merge(options, {
        optimizeSSR: false
      })
    })
    config.plugin('html').tap(args => {
      delete args[0].template
      delete args[0].templateParameters
      return args
    })
  }
}
