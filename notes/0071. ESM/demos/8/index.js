// index.js - 聚合导出（re-export）
export { add, subtract, PI } from './math.js'
export { capitalize, reverse } from './string.js'

// 也可以重命名后导出
export { add as sum } from './math.js'

// 导出所有（不推荐，可能导致命名冲突）
// export * from './math.js'
// export * from './string.js'
