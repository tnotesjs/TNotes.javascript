const foo = {}

console.log(foo) // {}

foo.prop = 123 // 为 foo 添加一个属性，可以成功，因为地址没变。

console.log(foo) // { prop: 123 }

foo = {} // ❌ TypeError: "foo" is read-only

/*
const foo = {}

foo = {}
将 foo 指向另一个对象，就会报错

上面代码中，常量 foo 储存的是一个地址，这个地址指向一个对象。
不可变的只是这个地址，即不能把 foo 指向另一个地址，但对象本身是可变的，所以依然可以为其添加新属性。
*/