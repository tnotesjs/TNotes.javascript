var obj = {
  key1: 1,
  key2: 2,
}

console.log(Object.keys(obj)) // ['key1', 'key2']
console.log(Object.values(obj)) // [1, 2]
console.log(Object.entries(obj)) // [['key1', 1], ['key2', 2]]

// 查看一个对象本身的所有成员：
// Object.keys 获取对象的键名数组
// Object.values 获取对象的键值数组
// Object.entries 获取键值对数组