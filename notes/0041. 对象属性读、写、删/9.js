var obj = { p: 1 }
console.log(obj, obj.p) // { p: 1 } 1

var isDeleted = delete obj.p
console.log('是否删除成功：', isDeleted) // 是否删除成功： true
console.log(obj, obj.p) // {} undefined

// delete 命令用于删除对象的属性，删除成功后返回 true。

// 从 对象 身上访问一个不存在的属性，默认并不会报错，而是返回一个 undefined。
// 所以在删除完 obj.p 之后，访问 obj.p 读到了 undefined。

console.log(obj.a) // undefined
// console.log(obj.a.b) // ❌ 报错：TypeError: Cannot read properties of undefined (reading 'b')

// 如果是从 undefined 身上访问一个不存在的属性，会报错。
// 比方说：我们访问 obj.a 不会报错，获取到的是 undefined，因为此时是从对象身上直接访问 a
// 如果我们访问 obj.a.b，此时就会报错，因为 obj.a 是 undefined。