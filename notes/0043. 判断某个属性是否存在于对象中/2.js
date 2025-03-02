var obj = {}
if ('toString' in obj) {
  console.log('检测到 obj 身上存在 toString 方法')
  var isOwnProperty = obj.hasOwnProperty('toString')
  console.log('进一步检测是否是自身的属性：', isOwnProperty)
} else {
  console.log('检测到 obj 身上不存在 toString 方法')
}

// 输出：
// 检测到 obj 身上存在 toString 方法
// 进一步检测是否是自身的属性： false

// in 不能识别哪些属性是对象自身的，哪些属性是继承的。
// 若使用 in 判断时得到的结果是 true，那么意味着对象能够访问到这个属性。
// 如果还需要进一步验证是否是自身的属性，可以使用对象的 hasOwnProperty 方法进一步判断。
