const x1 = 1
const x2 = 2

// 写法 1【不推荐】
if (x1 !== 1)
  if (x2 === 2) console.log('hello')
  else console.log('world')

// 写法 2【推荐】
// if (x1 !== 1) {
//   if (x2 === 2) {
//     console.log('hello')
//   } else {
//     console.log('world')
//   }
// }

// 最终将不会有任何输出
// 写法 1 和写法 2 是等效的
// else 和最近的 if 配对
// 建议在写 if...else 结构时，使用 {} 包裹代码块，以提高代码可读性。
