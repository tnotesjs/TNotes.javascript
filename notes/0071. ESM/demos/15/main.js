import * as utils from './utils/index.js'

console.log('main.js called')
console.dir(utils)

// 由于 ESM 有缓存 后续的具名导入不会导致模块重新执行
// import { add, getRandom } from './utils/index.js'
