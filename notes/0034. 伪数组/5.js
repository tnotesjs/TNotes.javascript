var arrayLike = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
}

function print(value, index) {
  console.log(index + ' : ' + value)
}

Array.prototype.forEach.call(arrayLike, print)

// 输出：
// 0 : a
// 1 : b
// 2 : c

// 上面代码中，arrayLike 代表一个类似数组的对象，
// 本来是不可以使用数组的 forEach() 方法的，但是通过 call()，
// 可以把 forEach() 嫁接到 arrayLike 上面调用。