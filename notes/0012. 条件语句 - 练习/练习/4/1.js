var money = 1000000 // 100 万
var year = 1

if (isNaN(money) || isNaN(year) || money <= 0 || year <= 0) {
  console.log('输入有误')
} else {
  var rate = 0.04 // 年利率4%
  if (money >= 500000) {
    rate = 0.045
  }
  var earnMoney = money * rate * year // 收益
  if (money >= 2000000) {
    earnMoney += earnMoney * 0.1
  }
  console.log(`总收益为：${earnMoney}`)
}
