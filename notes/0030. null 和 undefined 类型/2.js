if (undefined) {
  console.log('undefined is true')
} else {
  console.log('undefined is false')
}

if (null) {
  console.log('null is true')
} else {
  console.log('null is false')
}

// 输出：
// undefined is false
// null is false

// null 和 undefined 都是 falsy（假值）
// 在 if 条件块中，它们都等价于 false。