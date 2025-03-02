/*
使用 new.target 可以判断函数是通过 new 还是直接调用的
*/
function f() {
  console.log('new.target =>', new.target)
  console.log(new.target === f);
}

f()
// undefined
// false

new f()
// new.target => [Function: f]
// true