// index.js - 默认导入等价写法对比
console.log('=== 默认导入的 4 种等价写法 ===\n')

// 方式 1：分别导入
await import('./index-1.js')
console.log()

// 方式 2：混合导入
await import('./index-2.js')
console.log()

// 方式 3：default as 别名
await import('./index-3.js')
console.log()

// 方式 4：命名空间导入
await import('./index-4.js')

console.log('\n✅ 以上 4 种写法完全等价')
