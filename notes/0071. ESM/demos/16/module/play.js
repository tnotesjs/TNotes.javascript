import * as map from './map.js'

export function playerMove(direction) {
  var playerPoint = getPlayerPoint()
  var nextInfo = getNextInfo(playerPoint.row, playerPoint.col, direction)

  if (nextInfo.value === map.WALL) {
    return false
  }

  if (nextInfo.value === map.SPACE) {
    exchange(playerPoint, nextInfo)
    return true
  } else {
    var nextNextInfo = getNextInfo(nextInfo.row, nextInfo.col, direction)
    if (nextNextInfo.value === map.SPACE) {
      exchange(nextInfo, nextNextInfo)
      exchange(playerPoint, nextInfo)
      return true
    } else {
      return false
    }
  }
}

export function isWin() {
  for (var i = 0; i < map.correct.length; i++) {
    var point = map.correct[i]
    if (map.content[point.row][point.col] !== map.BOX) {
      return false
    }
  }
  return true
}

function exchange(point1, point2) {
  var temp = map.content[point1.row][point1.col]
  map.content[point1.row][point1.col] = map.content[point2.row][point2.col]
  map.content[point2.row][point2.col] = temp
}

function getPlayerPoint() {
  for (var row = 0; row < map.rowNumber; row++) {
    for (var col = 0; col < map.colNumber; col++) {
      if (map.content[row][col] === map.PLAYER) {
        return { row: row, col: col }
      }
    }
  }
  throw new Error('地图上居然没有玩家')
}

function getNextInfo(row, col, direction) {
  if (direction === 'left') {
    return { row: row, col: col - 1, value: map.content[row][col - 1] }
  } else if (direction === 'right') {
    return { row: row, col: col + 1, value: map.content[row][col + 1] }
  } else if (direction === 'up') {
    return { row: row - 1, col: col, value: map.content[row - 1][col] }
  } else {
    return { row: row + 1, col: col, value: map.content[row + 1][col] }
  }
}
