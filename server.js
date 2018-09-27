const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const koaStatic = require('koa-static')
const { createBundleRenderer } = require('vue-server-renderer')

const resolve = filepath => path.resolve(__dirname, filepath)
const contentType = require('./middlewares/contentType')
const serveStatic = require('./middlewares/serveStatic')
const staticCache = require('./middlewares/staticCache')

const templatePath = resolve('./src/index.template.html')

const app = new Koa()
const router = new KoaRouter()

// 开放目录
app.use(koaStatic(resolve('./dist')))

const createRenderer = (bundle, options = {}) => {
  return createBundleRenderer(bundle, Object.assign(options, {
    runInNewContext: false,
    template: fs.readFileSync(templatePath, 'utf-8')
  }))
}

let renderer

// 生产环境直接使用已经生成的 serverBundle 和 clientManifest
const prodBundle = require('./dist/vue-ssr-server-bundle.json')
const prodClientManifest = require('./dist/vue-ssr-client-manifest.json')

renderer = createRenderer(prodBundle, {
  clientManifest: prodClientManifest
})

const render = async (ctx, next) => {
  const url = ctx.request.url

  const context = {
    title: 'vue-cli3-ssr-template',
    url
  }

  ctx.body = await renderer.renderToString(context)
}

router.get('/service-worker.js', staticCache(resolve('./dist/service-worker.js')))
router.get('/manifest.json', staticCache(resolve('./dist/manifest.json')))
router.get('*', render)

app.use(contentType())
app.use(serveStatic('/dist', 'dist', {
  maxAge: 365 * 24 * 60 * 60
}))

app.use(router.routes())

app.listen(3002, err => {
  if (err) throw new Error(err)
  console.log('Server is running at http://localhost:3002')
})
