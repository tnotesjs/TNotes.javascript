const obj = {
  prop: 'exists',
}

console.log(Object.hasOwn(obj, 'prop')) // true
console.log(Object.hasOwn(obj, 'toString')) // false

// 可以认为 Object.hasOwn(obj, 'prop') 和 Object.prototype.hasOwnProperty.call(obj, 'prop') 是等价的。

// 但是使用 Object.hasOwn() 可以避免在 obj 的原型链上存在 hasOwnProperty 属性时，出现意外。
// 因此更推荐 Object.hasOwn()