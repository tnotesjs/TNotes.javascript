// const a = 1;       // 这是一个声明变量的表达式
// function test() {} // 这是一个声明函数的表达式
// class Person {}    // 这是声明类的一个表达式



// 1. 导出变量声明表达式
export const a = 1;
// 导出 a ，值为 1。
// 类似于 CommonJS 中的 exports.a = 1;


// 2. 导出函数声明表达式
export function test() {
  console.log('this is a method.');
}
// 导出 test，值为一个函数。
// 类似于 CommonJS 中的 exports.test = function () { console.log('this is a method.'); }


// 3. 导出类声明表达式
export class Person {}
// 导出 Person 类
// 类似于 CommonJS 中的 exports.Person = class {}