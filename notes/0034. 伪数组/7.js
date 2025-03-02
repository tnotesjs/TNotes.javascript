// 写法 1
Array.prototype.forEach.call('abc', function (char) {
  console.log(char)
})
// 输出：
// a
// b
// c

// 写法 2【推荐使用这种写法】
var arr = Array.prototype.slice.call('abc')
arr.forEach(function (chr) {
  console.log(chr)
})
// 输出：
// a
// b
// c

// 字符串也是类似数组的对象，所以也可以用 Array.prototype.forEach.call 遍历。

// 【扩展】
// 这种方法比直接使用数组原生的 forEach 要慢。
// 性能损耗主要体现在：
// 1. 调用链太长，需要额外的解析和执行步骤，这些步骤会带来一定的性能开销。
// 2. 无法利用 JS 引擎对原生数组方法的优化，这些优化包括内存管理、缓存优化、循环展开等。
// 所以最好还是先将“类似数组的对象”转为真正的数组，
// 然后再直接调用数组的 forEach 方法。
