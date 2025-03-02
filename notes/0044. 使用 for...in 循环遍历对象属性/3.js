// 我们可以手动给原型链的终点加点儿内容，来测试 for...in 遍历。
Object.prototype.a = 1
Object.prototype.b = 2

var obj = { x: 1 }

for (var key in obj) {
  console.log('key:', key, 'val:', obj[key])
}
// 输出：
// key: x val: 1
// key: a val: 1
// key: b val: 2

// 这个示例说明：
// for...in 循环，不仅遍历对象自身的属性，还遍历继承的属性。
