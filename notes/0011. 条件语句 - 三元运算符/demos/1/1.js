const n = 1

// 写法 1
const isEven = n % 2 === 0 ? true : false

// 写法 2
// const isEven
// if (n % 2 === 0) {
//   isEven = true
// } else {
//   isEven = false
// }

console.log(isEven)

// 上述两种写法表示的逻辑是一样的，都用于判断 n 是否是一个偶数。
// 判断逻辑：如果 n 可以被 2 整除，则 isEven 等于 true，否则等于 false。

// 从写法上来看，显然写法 1 更简洁，但是写法 2 也能表达清楚意思。
// 通常对于这些简单的判断逻辑，写法 1 就足够了。

// 最终输出结果：
// false
