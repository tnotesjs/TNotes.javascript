/*
【特殊情况】
如果参与运算的对象是 Date 对象的实例，
那么会优先调用 toString 方法，而不是 valueOf 方法。
*/
var obj1 = new Date()
obj1.valueOf = function () {
  console.log('obj1 的 valueOf 方法被调用了')
  return 1
}
obj1.toString = function () {
  console.log('obj1 的 toString 方法被调用了')
  return 'hello'
}

console.log(obj1 + 2)
// obj1 的 toString 方法被调用了
// "hello2"

// -------------------------------------------

var obj2 = {
  valueOf: function () {
    console.log('obj2 的 valueOf 方法被调用了')
    return 1
  },
  toString: function () {
    console.log('obj2 的 toString 方法被调用了')
    return 'obj2'
  },
}

console.log(obj2 + 2)
// obj2 的 valueOf 方法被调用了
// 3
