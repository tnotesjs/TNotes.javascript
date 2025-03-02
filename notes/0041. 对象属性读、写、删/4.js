var obj = {
  0.7: 'Hello World', // 数字键可以不加引号，因为会自动转成字符串。
  // 等效于：
  // '0.7': 'Hello World'
}

console.log(obj['0.7']) // "Hello World"
console.log(obj[0.7]) // "Hello World"
console.log(obj[0.7] === obj['0.7']) // true


// 上面代码中，对象 obj 的数字键 0.7，加不加引号都可以，因为会被自动转为字符串。
