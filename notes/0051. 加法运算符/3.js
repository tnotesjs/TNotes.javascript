/*
【字符串拼接】

如果是两个字符串相加
  这时加法运算符会变成连接运算符
  返回一个将两个原字符串拼接在一起的新字符串

如果一个运算子是字符串，另一个运算子是非字符串
  这时非字符串会转成字符串
  然后再连接在一起
*/

console.log('a' + 'bc')
// "abc"

console.log(1 + 'a')
// "1a"

console.log(false + 'a')
// "falsea"

console.log(true + 'a')
// "truea"