var arr = [
  { a: 1 },
  [1, 2, 3],
  function () {
    return true
  },
]

console.log(arr[0]) // { a: 1 }
console.log(arr[1]) // [1, 2, 3]
console.log(arr[2]) // [Function (anonymous)]

// 对象的 key 只能是字符串（或 Symbol）
// 但 val 可以是任意类型。

// 数组和对象一样，数组的 val 也可以是任意类型。
