(function(module){
  // 1. 在模块开始执行前，初始化一个值 module.exports = {}，这个值就是需要导出的玩意儿
  module.exports = {};

  // 2. 为了方便开发者便捷的导出，nodejs 在初始化完 module.exports 后，又声明了一个变量 exports，并将其赋值为 module.exports。使用 exports 可以导出模块中内容的原理。
  var exports = module.exports;

  // 3. ... 这部分是从指定模块中读取到的代码，这些内容都是封装到一个函数中去执行的。这就是为什么 CommonJS 模块中的内容不会污染全局。

  // 4. 最终导出的是 module.exports
  return module.exports;
})()