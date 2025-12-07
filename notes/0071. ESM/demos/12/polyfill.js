// polyfill.js - 全局初始化脚本
console.log('🔧 初始化全局配置...')

// 模拟 polyfill 注入
if (!Array.prototype.at) {
  Array.prototype.at = function (index) {
    return this[index >= 0 ? index : this.length + index]
  }
  console.log('✅ Array.prototype.at polyfill 已注入')
}

// 全局配置
globalThis.APP_CONFIG = {
  version: '1.0.0',
  env: 'development',
}
console.log('✅ 全局配置已设置', globalThis.APP_CONFIG)
