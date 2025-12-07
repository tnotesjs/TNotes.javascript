// utils.js - 辅助工具函数
export function log(message, type = 'info') {
  const styles = {
    info: '\x1b[36m', // 青色
    success: '\x1b[32m', // 绿色
    error: '\x1b[31m', // 红色
    warning: '\x1b[33m', // 黄色
  }

  const reset = '\x1b[0m'
  const color = styles[type] || styles.info

  console.log(`${color}${message}${reset}`)
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const GAME_CONFIG = {
  MIN: 1,
  MAX: 100,
  MAX_ATTEMPTS: 10,
}
