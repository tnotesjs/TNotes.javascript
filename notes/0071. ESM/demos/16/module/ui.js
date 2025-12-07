// 该模块用于将地图显示到页面上
import * as map from './map.js'

var divContainer = document.getElementById('game')
var pieceWidth = 45 // 每一个小块的宽度
var pieceHeight = 45 // 每一个小块的高度

function setDivContainer() {
  divContainer.style.width = pieceWidth * map.colNumber + 'px'
  divContainer.style.height = pieceHeight * map.rowNumber + 'px'
}

function isCorrect(row, col) {
  for (var i = 0; i < map.correct.length; i++) {
    var point = map.correct[i]
    if (point.row === row && point.col === col) {
      return true
    }
  }
  return false
}

function setOnePiece(row, col) {
  var value = map.content[row][col]
  var div = document.createElement('div')
  div.className = 'item'
  div.style.left = col * pieceWidth + 'px'
  div.style.top = row * pieceHeight + 'px'

  var correct = isCorrect(row, col)
  if (value === map.PLAYER) {
    div.classList.add('player')
  } else if (value === map.WALL) {
    div.classList.add('wall')
  } else if (value === map.BOX) {
    if (correct) {
      div.classList.add('correct-box')
    } else {
      div.classList.add('box')
    }
  } else {
    if (correct) {
      div.classList.add('correct')
    } else {
      return
    }
  }

  divContainer.appendChild(div)
}

function setContent() {
  divContainer.innerHTML = ''
  for (var row = 0; row < map.rowNumber; row++) {
    for (var col = 0; col < map.colNumber; col++) {
      setOnePiece(row, col)
    }
  }
}

export default function () {
  setDivContainer()
  setContent()
}
