// index.js
import { a } from './a.js'
import { b } from './b.js'

// 运行 index.js，输出结果如下：
// b.js called
// a.js called

// 在 a.js 中也引入了 b.js 模块
// 因为存在模块缓存机制，所以 b.js called 只会执行一次。