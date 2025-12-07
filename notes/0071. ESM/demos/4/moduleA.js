// moduleA.js - 重命名导出
const userName = 'Tdahuyou'
const userAge = 26

function getUserInfo() {
  return `${userName}, ${userAge}`
}

// 导出时重命名
export { userName as name, userAge as age, getUserInfo as getInfo }
