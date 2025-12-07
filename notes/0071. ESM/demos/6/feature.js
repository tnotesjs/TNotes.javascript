// feature.js - 需要动态加载的模块
export function heavyComputation() {
  console.log('执行复杂计算...')
  return Array.from({ length: 1000000 }, (_, i) => i).reduce((a, b) => a + b, 0)
}

export const config = {
  mode: 'production',
  cache: true,
}
