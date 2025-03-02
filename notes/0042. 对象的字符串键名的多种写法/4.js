var obj = {
  foo: 123,
  bar: 'abc',
  double: function (x) {
    return 2 * x
  },
}

console.log(obj.double(1)) // 2

// 上面代码中，对象 obj 的属性 double，就指向一个函数。
// 我们通常称 double 为对象 obj 的方法，称 foo、bar 为对象 obj 的属性。

// 方法、属性，又统称为成员，在口语表述中，我们可以这么说：
// 上述对象一共有 3 个成员，分别是 foo、bar、double。
// 其中包含两个属性 foo、bar，一个方法 double。