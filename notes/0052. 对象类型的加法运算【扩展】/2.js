/*
对象 obj 转成原始类型的值，规则如下。

【第一步】先调用 obj.valueOf() 方法。
一般来说，对象的 valueOf 方法总是返回对象自身。
如果被重写的话，则根据重写的规则返回。

【第二步】判断 valueOf 方法的返回值是否是原始类型的值。
如果 valueOf 方法返回的是原始类型的值，就会用这个值来进行加法运算。
如果 valueOf 方法返回的还是对象，就会自动调用 obj.valueOf().toString() 方法。
  - 如果 toString 方法返回的是原始类型的值，就会用这个值来进行加法运算。
  - 如果 toString 方法返回的还是对象，就报错。
*/

// -------------------------------------------
// #region demo1
// -------------------------------------------

var obj1 = { p: 1 }

console.log(obj1.valueOf())
// { p: 1 }

console.log(obj1.valueOf().toString())
// "[object Object]"

console.log(obj1 + 2)
// "[object Object]2"

console.log(obj1.valueOf().toString() + 2)
// "[object Object]2"

// -------------------------------------------
// #endregion demo1
// -------------------------------------------

// -------------------------------------------
// #region demo2
// -------------------------------------------

var obj2 = {
  valueOf: function () {
    return 1
  },
  toString: function () {
    console.log('obj2 的 toString 方法被调用了')
    return 'obj2'
  },
}

console.log(obj2 + 2)
// 3

// -------------------------------------------
// #endregion demo2
// -------------------------------------------

// -------------------------------------------
// #region demo3
// -------------------------------------------
var obj3 = {
  val: 'hello',
  valueOf: function () {
    console.log('obj3 的 valueOf 方法被调用了')
    return this
  },
  toString: function () {
    return this.val
  },
}

console.log(obj3.valueOf())
// obj3 的 valueOf 方法被调用了
// {
//   val: 'hello',
//   valueOf: [Function: valueOf],
//   toString: [Function: toString]
// }

console.log(obj3 + 2)
// obj3 的 valueOf 方法被调用了
// hello2

// -------------------------------------------
// #endregion demo3
// -------------------------------------------

// -------------------------------------------
// #region demo4
// -------------------------------------------

var obj4 = {
  toString: function () {
    return this
  },
}

// console.log(obj4 + 2)
// 报错：TypeError: Cannot convert object to primitive value
// -------------------------------------------
// #endregion demo4
// -------------------------------------------