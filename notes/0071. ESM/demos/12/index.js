// index.js - 无绑定导入示例
// ✅ 仅执行模块，不导入任何内容
import './polyfill.js'

// 使用全局配置
console.log('当前环境：', globalThis.APP_CONFIG.env)

// 使用 polyfill
const arr = [1, 2, 3, 4, 5]
console.log('arr.at(-1):', arr.at(-1)) // 5
