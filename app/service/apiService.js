/**
 * @Description 校验参数
 * @Author luomingfeng
 * @Date 2022/3/26 16:51
 */

const Service = require('egg').Service

class ApiService extends Service {
  constructor(ctx) {
    super(ctx)
    this.codeMap = this.config.codeMap
    this.errorMap = this.config.errorMap
    this.params = ctx.method === 'GET' ? ctx.query : ctx.request.body
    this.directory = ctx.url.replace('/api/', '').split('/')
  }

  async verifyApiParam() {
    const validate = await this.paramHandle()
    if (!this.app.isEmptyObject(validate)) return validate
    let callService = await this.service
    this.directory.forEach((v) => {
      callService = callService[v]
    })
    return callService.call(this)
  }

  async paramHandle() {
    const keyCount = this.app.extractKey(this.params).length
    const validteKeyCount = this.app.extractKey(this.app.validateRule).length

    if (this.app.isEmptyObject(this.app.validateRule ?? {})) {
      return this.responseHandler(this.errorMap.PARAM_RULE_NO_ALLOW_EMPTY)
    }
    if (this.app.isEmptyObject(this.params)) {
      return this.responseHandler(this.errorMap.PARMA_MISSING)
    }
    if (keyCount < validteKeyCount) {
      return this.responseHandler(this.errorMap.PARMA_MISSING)
    }
    if (keyCount > validteKeyCount) {
      return this.responseHandler(this.errorMap.PARMA_ERROR)
    }

    for (const i in this.app.validateRule) {
      const validateType = this.app.validateRule[i].type
      if (this.app.isInArray(this.app.extractKey(this.params), validateType)) {
        return this.responseHandler(this.errorMap.PARMA_ERROR)
        // todo
      }
    }

    return []
  }

  async responseHandler(code = this.app.config.errorMap.SUCCESS, data = '') {
    return {
      code: code,
      message: this.codeMap[code],
      data: data,
    }
  }
}

module.exports = ApiService
