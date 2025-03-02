var obj = {}
var isDeleted = delete obj.p
console.log('是否删除成功：', isDeleted) // 是否删除成功：true

// 删除一个不存在的属性，delete 不报错，而且返回 true。
// 因此，不能根据 delete 命令的返回结果，来判断某个属性是否存在。