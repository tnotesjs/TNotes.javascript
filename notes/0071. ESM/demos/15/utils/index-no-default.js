// index-no-default.js - 演示 export * 不包含 default
export * from './sayHello.js'
// ⚠️ export * 不会导出 default，需要显式导出
// 如果需要导出 default，必须使用：
// export { default as sayHello } from './sayHello.js'

console.log('utils/index-no-default.js called')
