var obj = { a: 1, b: 2, c: 3 }

for (var key in obj) {
  console.log('key:', key, 'val:', obj[key])
}
// 输出：
// key: a val: 1
// key: b val: 2
// key: c val: 3

// for...in 循环用来遍历一个对象的全部属性。
