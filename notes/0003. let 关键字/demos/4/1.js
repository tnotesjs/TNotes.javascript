function bar(x = y, y = 2) {
  console.log([x, y])
}

bar() // ❌ 报错

function foo(x = 2, y = x) {
  console.log([x, y])
}
foo() // [2, 2]

// 有些“死区”比较隐蔽，不太容易发现。
// 上面代码中，调用 bar 函数之所以报错，是因为参数 x 默认值等于另一个参数 y，而此时 y 还没有声明，属于“死区”。
// 如果 y 的默认值是 x，就不会报错，因为此时 x 已经声明了。
