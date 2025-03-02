/**
 * 打印一个对象的某个属性
 * @param {object} obj 要打印的对象
 * @param {string} key 要打印的对象属性名
 */
function printProperty(obj, key) {
  // 输出对象的指定属性
  if (obj.hasOwnProperty(key)) {
    console.log(obj[key])
  } else {
    console.log(`属性 ${key} 不存在`)
  }
}

var person = { name: 'Tdahuyou', age: 25, sex: '男' }

// 测试用例
printProperty(person, 'name') // Tdahuyou
printProperty(person, 'age') // 25
printProperty(person, 'sex') // 男

// 答案不唯一，能能确保【测试用例】的输出结果符合预期即可。
// 上述实现的函数还做了一些额外的校验。