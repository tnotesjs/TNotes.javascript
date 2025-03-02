Function.prototype.a = 1
// A 的原型链会经过 Function.prototype，因此 A.a 是 1
// a 的原型链不会经过 Function.prototype，因此 a.a 是 undefined
Object.prototype.b = 2
// 链条的终点存在一个 b，值为 2，因此下面的 a.b 和 A.b 都可以访问到它。

function A() {}

var a = new A()

console.log(a.a, a.b)
console.log(A.a, A.b)