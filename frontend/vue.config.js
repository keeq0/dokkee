const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  devServer: {
    allowedHosts: 'all',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    }
  },
  chainWebpack: config => {
    config.plugin('html')
      .tap(args => {
        args[0].title = 'Dokkee - сервис проверки документов'
        return args
      })
  }
})
