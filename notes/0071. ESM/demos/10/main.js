// main.js - 猜数字游戏主程序
import Game from './game.js'
import { log, delay, GAME_CONFIG } from './utils.js'

async function playGame() {
  log('=== 欢迎来到猜数字游戏 ===', 'success')
  log(`请猜一个 ${GAME_CONFIG.MIN} 到 ${GAME_CONFIG.MAX} 之间的数字`, 'info')
  log(`你有 ${GAME_CONFIG.MAX_ATTEMPTS} 次机会\n`, 'warning')

  const game = new Game(GAME_CONFIG.MIN, GAME_CONFIG.MAX)

  // 模拟玩家猜测
  const guesses = [50, 75, 62, 68, 71, 69, 70]

  for (const guess of guesses) {
    await delay(800) // 模拟思考时间

    log(`猜测: ${guess}`)
    const result = game.guess(guess)

    const stats = game.getStats()
    if (stats.gameOver) {
      log(result, 'success')
      break
    } else {
      log(result, 'warning')
    }
  }

  log('\n游戏统计:', 'info')
  console.log(game.getStats())
}

// 启动游戏
playGame()
