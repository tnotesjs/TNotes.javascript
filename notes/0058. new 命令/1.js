/*
在函数内部使用 use strict 开启严格模式
如果此时再使用 new 调用该函数，this 就不再指向全局对象，而是 undefined
当构造函数被错误调用（指没有使用 new 关键字调用）的情况下，就会抛出错误（若内部使用到了 this.xxx 的话）
*/
function Fubar(foo, bar){
  'use strict';
  this._foo = foo;
  this._bar = bar;
}

Fubar()
// TypeError: Cannot set property '_foo' of undefined