// #region 题目描述
// 老张，75岁，爱好钓鱼、下棋、唱京剧
// 小李，28岁，爱好打篮球、看电影
// 小美，19岁，爱好绘画、弹吉他、旅行

// 用字面量描述上面的信息

// 思考：
// 1. 如何得到平均年龄
// 2. 如何得到所有人所有爱好的总数
// #endregion 题目描述

// 分析：
// 描述中有多个人，每个人都是一个对象类型，可以使用数组来存储这些人的信息。
// 每个人有多个爱好，这个信息也应该是一个数组类型。

var users = [
  {
    name: '老张',
    age: 75,
    hobbies: ['钓鱼', '下棋', '唱京剧'],
  },
  {
    name: '小李',
    age: 27,
    hobbies: ['打篮球', '看电影'],
  },
  {
    name: '小美',
    age: 18,
    hobbies: ['绘画', '弹吉他', '旅行'],
  },
]

var sumAge = 0,
  totalHobbies = 0
for (var i = 0; i < users.length; i++) {
  sumAge += users[i].age
  totalHobbies += users[i].hobbies.length
}
console.log(`平均年龄: ${sumAge / users.length}`)
console.log(`所有爱好的总数: ${totalHobbies}`)

// 输出：
// 平均年龄: 40
// 所有爱好的总数: 8
