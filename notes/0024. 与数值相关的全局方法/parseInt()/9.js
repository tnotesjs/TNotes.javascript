console.log(parseInt(0x11, 36)) // 43
console.log(parseInt(0x11, 2)) // 1

// 等同于
console.log(parseInt(String(0x11), 36)) // 43
console.log(parseInt(String(0x11), 2)) // 1

// 等同于
console.log(parseInt('17', 36)) // 43
console.log(parseInt('17', 2)) // 1

// 前面说过，如果 parseInt 的第一个参数不是字符串，会被先转为字符串。
// 这会导致一些令人意外的结果。

// 上面代码中，十六进制的 0x11 会被先转为十进制的 17，再转为字符串。
// 然后，再用 36 进制或二进制解读字符串 17，最后返回结果 43 和 1。
