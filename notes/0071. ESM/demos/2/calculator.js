// calculator.js - 默认导出示例
export default class Calculator {
  add(a, b) {
    return a + b
  }

  subtract(a, b) {
    return a - b
  }

  multiply(a, b) {
    return a * b
  }

  divide(a, b) {
    if (b === 0) {
      throw new Error('除数不能为 0')
    }
    return a / b
  }
}
