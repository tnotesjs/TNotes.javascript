// counter.js - 演示 ESM 绑定特性
export let count = 0

export function increment() {
  count++
  console.log('counter.js 内部 count:', count)
}

export function getCount() {
  return count
}
