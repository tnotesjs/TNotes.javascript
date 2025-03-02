var foo = {
  n: 0,
  k: {
    n: 0,
  },
}
// foo 是一个对象，有两个属性 n 和 k，其中 k 本身也是一个对象，且 k.n 初始值为 0

var bar = foo.k
// bar 引用了 foo.k 对象，bar 和 foo.k 都指向同一个对象 { n: 0 }

bar.n++
// bar.n++ 相当于 foo.k.n++，所以 foo.k.n 从 0 增加到 1

bar = {
  n: 10,
}
// bar 被赋值为一个新的对象 { n: 10 }，此时 bar 不再引用 foo.k

bar = foo
// bar 重新被赋值为 foo 对象，此时 bar 和 foo 指向同一个对象

bar.n++
// bar.n++ 相当于 foo.n++，所以 foo.n 从 0 增加到 1

bar = foo.n
// bar 被赋值为 foo.n 的值，此时 bar 是一个数值 1

bar++
// bar++ 自增，bar 变为 2，但此时 foo.n 的值并没有改变，仍然是 1

console.log(foo.n, foo.k.n)
// 打印 foo.n 和 foo.k.n，分别是 1 和 1