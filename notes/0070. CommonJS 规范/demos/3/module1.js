// module1.js
function getNumber() {
  count++
  return count
}

const user = {
  name: 'Tdahuyou',
  age: 24,
}

exports.getNumber = getNumber
exports.user = user

// 如果是自己写的模块，导入的时候，路径开头是 ./ 或 ../
// 如果是内置模块或者第三方模块，导入的时候，路径开头不需要加 ./ 或 ../
