var name = 'Tdahuyou'
var age = 25
var sex = '男'
// 把上面三个数据组装成一个对象，对象的属性名和变量名相同
var person = {
  name,
  age,
  sex,
}

console.log(person) // { name: 'Tdahuyou', age: 25, sex: '男' }
console.log(person.name) // Tdahuyou
console.log(person.age) // 25
console.log(person.sex) // 男

// 上面用到了 ES6 的对象简写语法
// 实际上和下面的写法是等效的：
// var person = {
//   name: name,
//   age: age,
//   sex: sex,
// }