/*
当使用 new 关键字调用构造函数的时候
简单理解 new 的原理 —— 实际上 new 关键字帮我们做了两件事儿
1. 在函数局部作用域的开头加了一条语句
  var this = {}
2. 在函数结尾加了一条语句
  return this
*/
function Person(firstName, lastName) {
  // var this = {};

  this.firstName = firstName;
  this.lastName = lastName;
  this.fullName = firstName + lastName;
  this.sayHi = function () {
    console.log('我的名字叫做：' + this.fullName);
  };

  // return this;
}

var person1 = new Person('陶', '家乐');
person1.sayHi();

// var person2 = new Person('?', '?')