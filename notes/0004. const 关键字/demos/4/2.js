var constantize = (obj) => {
  Object.freeze(obj)
  Object.keys(obj).forEach((key, i) => {
    if (typeof obj[key] === 'object') {
      // 是引用类型
      constantize(obj[key]) // 递归
    }
  })
}

// 除了将对象本身冻结，对象的属性也应该冻结。
// 通过上述做法，可以将一个对象彻底冻结。
