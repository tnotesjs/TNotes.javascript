/*
判断构造函数是否使用 new 关键字调用
*/
function Fubar(foo, bar) {
  if (!(this instanceof Fubar)) {
    console.log('未使用 new 调用')
    return new Fubar(foo, bar);
  } else {
    console.log('使用 new 调用')
  }

  this._foo = foo;
  this._bar = bar;
}

console.log(Fubar(1, 2)._foo); // 1
console.log((new Fubar(1, 2))._foo); // 1