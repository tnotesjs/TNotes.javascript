module2.js 中的语句 `const obj = require('./module1.js')` 我们可以将其理解为下面这段程序。写了这句话，其实就相当于写了下面这一段程序：

```js
// module2.js
// const obj = require('./module1.js')

const obj = (function (module) {
  /* 内部会自动为该函数传递这样一个参数 module */
  module.exports = {}
  let exports = module.exports

  /* ---> module1.js 开始 <--- */
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
  /* ---> module1.js 结束 <--- */

  return module.exports
})()
```
