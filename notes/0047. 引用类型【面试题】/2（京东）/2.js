var foo = {
  n: 1,
};
// foo 是一个对象，初始属性 n 的值为 1

var arr = [foo];
// arr 是一个数组，包含一个元素，即对象 foo

function method1(arr) {
  var bar = arr[0];
  // bar 引用了 arr 数组的第一个元素，即 foo 对象

  arr.push(bar);
  // 将 bar 添加到 arr 数组末尾，arr 现在是 [foo, foo]

  bar.n++;
  // bar.n++ 相当于 foo.n++，所以 foo.n 从 1 增加到 2

  arr = [bar];
  // arr 被重新赋值为一个新数组 [bar]，此时 arr 是 [foo]

  arr.push(bar);
  // 将 bar 添加到新的 arr 数组末尾，arr 现在是 [foo, foo]

  arr[1].n++;
  // arr[1].n++ 相当于 foo.n++，所以 foo.n 从 2 增加到 3
}

function method2(foo) {
  foo.n++;
  // foo.n++ 相当于 foo.n = foo.n + 1，所以 foo.n 从 3 增加到 4
}

function method3(n) {
  n++;
  // n 是值传递，n++ 只是在函数内部增加 n 的值，不影响外部 foo.n 的值
}

method1(arr);
// 调用 method1(arr)，经过以上解释 foo.n 变为 3

method2(foo);
// 调用 method2(foo)，foo.n 从 3 增加到 4

method3(foo.n);
// 调用 method3(foo.n)，foo.n 的值传递给 n，n 在函数内部自增，但 foo.n 不变，仍为 4

console.log(foo.n, arr.length);
// 打印 foo.n 和 arr.length，分别是 4 和 2
// arr 的长度是 2，因为 method1 中改变 arr 引用只在函数内部有效，外部的 arr 仍为 [foo, foo]