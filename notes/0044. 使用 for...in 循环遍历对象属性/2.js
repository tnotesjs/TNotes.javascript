var obj = {}

console.log(obj.toString) // toString() { [native code] }
console.log('toString' in obj) // true
console.log(obj.hasOwnProperty('toString')) // false

for (var p in obj) {
  console.log(p)
}
// 没有任何输出

// for...in 循环
// 遍历的是对象所有可遍历（enumerable）的属性，会跳过不可遍历的属性。
// 不仅遍历对象自身的属性，还遍历继承的属性。

// 对象都继承了 toString 属性，但是 for...in 循环不会遍历到这个属性。
// 上述对象 obj 继承了 toString 属性，该属性不会被 for...in 循环遍历到，因为它默认是“不可遍历”的。

// 属性描述符对象长下面这样：
console.log(Object.getOwnPropertyDescriptor(Object.prototype, 'toString'))
// {
//   value: [Function: toString],
//   writable: true,
//   enumerable: false, // 当你看到这里是 false 时，说明这个属性是不可遍历的。
//   configurable: true
// }