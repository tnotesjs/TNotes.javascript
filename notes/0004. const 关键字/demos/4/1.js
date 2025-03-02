// 'use strict'
const foo = Object.freeze({})

console.log(foo) // {}

foo.prop = 123 // 严格模式会报错
// ❌ TypeError: Cannot add property prop, object is not extensible

console.log(foo) // {}

/*
const foo = Object.freeze({})
如果真的想将对象冻结，应该使用 Object.freeze 方法。

foo.prop = 123
常规模式时，这一行不起作用；严格模式时，该行会报错。

'use strict'
在文件头部加上这个语句，就可以进入严格模式。

上面代码中，常量 foo 指向一个冻结的对象，所以添加新属性不起作用，严格模式时还会报错。
*/