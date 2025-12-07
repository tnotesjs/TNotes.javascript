// main.js - 混合导入示例
import config, { VERSION, formatDate } from './utils.js'

console.log('配置:', config)
console.log('版本:', VERSION)
console.log('当前日期:', formatDate(new Date()))
