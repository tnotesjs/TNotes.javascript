// game.js - 综合练习：简单的猜数字游戏
class Game {
  constructor(min = 1, max = 100) {
    this.min = min
    this.max = max
    this.secretNumber = this.generateRandomNumber()
    this.attempts = 0
    this.maxAttempts = 10
    this.gameOver = false
  }

  generateRandomNumber() {
    return Math.floor(Math.random() * (this.max - this.min + 1)) + this.min
  }

  guess(number) {
    if (this.gameOver) {
      return '游戏已结束！'
    }

    this.attempts++

    if (number === this.secretNumber) {
      this.gameOver = true
      return `🎉 恭喜！你猜对了！数字是 ${this.secretNumber}，你用了 ${this.attempts} 次`
    }

    if (this.attempts >= this.maxAttempts) {
      this.gameOver = true
      return `😢 游戏结束！正确答案是 ${this.secretNumber}`
    }

    const hint = number < this.secretNumber ? '太小了' : '太大了'
    const remaining = this.maxAttempts - this.attempts
    return `${hint}！还剩 ${remaining} 次机会`
  }

  reset() {
    this.secretNumber = this.generateRandomNumber()
    this.attempts = 0
    this.gameOver = false
    return '游戏已重置！'
  }

  getStats() {
    return {
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      remaining: this.maxAttempts - this.attempts,
      gameOver: this.gameOver,
    }
  }
}

export default Game
