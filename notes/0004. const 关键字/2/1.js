const foo // ❌ SyntaxError: Missing initializer in const declaration

// const 声明的变量不得改变值
// 这意味着，const 一旦声明变量，就必须立即初始化，不能留到以后赋值。

// 对于 const 来说，只声明不赋值，就会报错。