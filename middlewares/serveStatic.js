const koamount = require('koa-mount')
const koastatic = require('koa-static')

module.exports = function(url, filePath, opts = {}) {
  return koamount(url, koastatic(filePath, opts))
}
