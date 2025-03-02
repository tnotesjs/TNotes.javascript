// module1.js
let count = 0

function getNumber() {
  count++
  return count
}

const user = {
  name: 'Tdahuyou',
  bilibili: 'https://space.bilibili.com/407241004',
}

console.log('module1 called')

exports.getNumber = getNumber
exports.user = user