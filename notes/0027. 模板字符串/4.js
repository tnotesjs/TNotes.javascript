let name = 'Alice'
let age = 30
let x = 1
let y = 2
let obj = { x: 1, y: 2 }
function fn() {
  return 'Hello World'
}

console.log(`Hello, my name is ${name} and I am ${age} years old.`) // Hello, my name is Alice and I am 30 years old.
console.log(`${x} + ${y} = ${x + y}`) // "1 + 2 = 3"
console.log(`${x} + ${y * 2} = ${x + y * 2}`) // "1 + 4 = 5"
console.log(
  `${obj.x + obj.y}`
) // "3"
console.log(`foo ${fn()} bar`) // foo Hello World bar

// 在 ${ } 中，你可以填写字面量、表达式、变量，只要是值都可以往里面塞。
