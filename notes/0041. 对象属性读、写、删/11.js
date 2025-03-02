var obj = Object.defineProperty({}, 'p', {
  value: 123,
  configurable: false, // 默认为 true，若改为 false 表示不可配置，这意味着 delete 命令无法删除该属性。
})

console.log(obj.p) // 123
var isDeleted = delete obj.p
console.log('是否删除成功：', isDeleted) // 是否删除成功：false

// 只有一种情况，delete 命令会返回 false，那就是该属性存在，且不得删除。【属性描述符对象中，将 configurable 手动改为 false】
// 上面代码之中，对象 obj 的 p 属性是不能删除的，所以 delete 命令返回 false。
