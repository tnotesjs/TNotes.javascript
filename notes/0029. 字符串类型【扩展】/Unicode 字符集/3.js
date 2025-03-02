var emoji = '🙂'
console.log(emoji.length) // 2
console.log(emoji.charCodeAt(0)) // 55357
console.log(emoji.charCodeAt(1)) // 56898

// 上面代码中，JavaScript 认为 🙂 的长度为 2，而不是 1。

// 码点 U+1D306 对应的字符为 🙂，它写成 UTF-16 就是 0xD834 0xDF06。
// 对应的十进制数为 55357 56898

// 占 4 个字节的符号 🙂
// 高代理项范围是 0xD800 到 0xDFFF，也就是 55296 到 56319，上述的 55357 在这个范围内。
// 低代理项范围是 0xDC00 到 0xDFFF，也就是 56320 到 57343，上述的 56898 在这个范围内。

var s = 'a'
console.log(s.length) // 1
console.log(s.charCodeAt(0)) // 97

// 97 在 0 到 65535 之间，所以 JavaScript 认为它是一个单字节字符。

console.log(s.charCodeAt(1)) // NaN
// 符号 a 不需要 4 个字节的码点就能够表示，你再去读取它的下一个位置，得到的结果将会是 NaN。