var s = '123🙂🙂🙂' // 看到是 6 个符号

console.log(s.length) // 9 ❌ 这不是我们想要的结果

// 正确打印长度的一些做法
console.log(Array.from(s).length) // 6【转数组后再计算】
console.log([...s].length) // 6【转数组后再计算】
console.log((s.match(/[\s\S]/gu) || []).length) // 6【正则】

// 用 for...of 循环也行
let len1 = 0
for (let _ of s) len1++
console.log(len1) // 6

// 补充：如果是想要使用数组那一套 API 可能会有问题
let len2 = 0
Array.prototype.forEach.call(s, (_) => len2++)
console.log(len2) // 9
