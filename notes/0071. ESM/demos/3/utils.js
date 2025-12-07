// utils.js - 混合导出示例
export const VERSION = '1.0.0'

export function formatDate(date) {
  return date.toISOString().split('T')[0]
}

// 默认导出一个配置对象
export default {
  appName: 'My App',
  timeout: 5000,
  debug: true,
}
