// main.js
import * as utils from './utils/index.js'; // 导入 utils 目录下所有需要暴露出来的内容
// import { add, getRandom } from './utils/index.js'; // 因为有缓存，不会导致 add、getRandom 模块被重新执行

console.log('main.js called')

console.dir(utils)