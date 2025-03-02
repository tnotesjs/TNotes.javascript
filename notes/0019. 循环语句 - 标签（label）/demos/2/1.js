foo: {
  console.log(1)
  break foo
  console.log('本行不会输出')
}
console.log(2)

// 标签也可以用于跳出代码块。
// 上面代码执行到break foo，就会跳出区块。

// 最终输出结果：
// 1
// 2
