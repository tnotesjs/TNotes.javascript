function myIsNaN(value) {
  return typeof value === 'number' && isNaN(value)
}
// 使用 isNaN 之前，最好判断一下数据类型，以防止传入的不是数字类型。

function myIsNaN(value) {
  return value !== value
}
// 判断 NaN 还有一个巧妙的法子：利用 NaN 为唯一不等于自身的值的这个特点，进行判断。
