/*
有一个非常特别的对象，它的键值对是：
0: 'a'
1: 'b'
how are you: 'fine thank you'
*/
// 用字面量表示该对象，然后分别读取它的每个属性输出

const specialObject = {
  0: 'a',
  1: 'b',
  'how are you': 'fine thank you', // 重点考察特殊键名的书写，这里必须要加上引号。
}

// 分别读取每个属性并输出
console.log(specialObject[0]) // 输出 'a'
console.log(specialObject[1]) // 输出 'b'
console.log(specialObject['how are you']) // 输出 'fine thank you'
