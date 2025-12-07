// main.js - 使用 * 导入所有导出
import * as logger from './tools.js'

console.log('版本:', logger.version)
logger.log('这是一条普通日志')
logger.warn('这是一条警告')
logger.error('这是一条错误')
