// module1.js
let count = 0

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

// 等效写法：
// module.exports = {
//   getNumber,
//   user
// }