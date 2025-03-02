const fs = require('fs')
const path = require('path')

const outputFile = 'dir-list.json' // 输出的 JSON 文件名
const maxNumber = 9999 // 生成的最大编号

let data = {}

for (let i = 1; i <= maxNumber; i++) {
  const key = i.toString().padStart(4, '0') // 确保 4 位格式
  console.log(key)
  data[key] = {
    bilibili: [],
    done: false
  }
}

fs.writeFile(
  path.join(__dirname, outputFile),
  JSON.stringify(data, null, 2),
  (err) => {
    if (err) {
      console.error('写入文件失败:', err)
    } else {
      console.log(`成功生成 ${outputFile}`)
    }
  }
)
