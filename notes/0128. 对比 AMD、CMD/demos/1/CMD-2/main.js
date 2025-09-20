// main.js
define(function (require, exports, module) {
  console.log('模块 A 和 B 都还没加载')
  const todayIsWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
  if (todayIsWeekend) {
    require.async('./moduleA.js', (moduleA) => {
      console.log('模块 A 已加载，并已执行')
      moduleA.doSomething()
    })
  } else {
    require.async('./moduleB.js', (moduleB) => {
      console.log('模块 B 已加载，并已执行')
      moduleB.doSomethingElse()
    })
  }
})
