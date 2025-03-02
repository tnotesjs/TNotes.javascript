Object.prototype.a = 1
Object.prototype.b = 2

var obj = { x: 1 }

for (var key in obj) {
  if (obj.hasOwnProperty(key)) {
    console.log('【自身属性】', 'key:', key, 'val:', obj[key])
  } else {
    console.log('【非自身属性】', 'key:', key, 'val:', obj[key])
  }
}
// 输出：
// 【自身属性】 key: x val: 1
// 【非自身属性】 key: a val: 1
// 【非自身属性】 key: b val: 2

// 一般情况下，咱们都是只想遍历对象自身的属性，
// 所以使用 for...in 循环的时候，应该结合使用 hasOwnProperty 方法，
// 在循环内部判断一下，某个属性是否为对象自身的属性。
