var obj = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
}

console.log(obj[0]) // 'a'
console.log(obj[1]) // 'b'
console.log(obj.length) // 3
// console.log(obj.push('d')) // ❌ TypeError: obj.push is not a function

// 上面代码中，对象 obj 就是一个类似数组的对象。
// 但是，“类似数组的对象”并不是数组，因为它们不具备数组特有的方法。
// 对象 obj 没有数组的 push 方法，使用该方法就会报错。