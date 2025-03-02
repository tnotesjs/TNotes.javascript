var height = 166
var weight = 66
var gender = '男'

if (isNaN(height) || isNaN(weight) || (gender !== '男' && gender !== '女')) {
  console.log('输入有误')
} else {
  var standardWeight // 标准体重
  if (gender === '男') {
    standardWeight = (height - 80) * 0.7
  } else {
    standardWeight = (height - 70) * 0.6
  }

  if (weight < standardWeight * 0.9) {
    console.log('你的身体偏瘦，请加强营养')
  } else if (weight > standardWeight * 1.1) {
    console.log('你的身体偏胖，请加强锻炼')
  } else {
    console.log('你的体重正常，请继续保持')
  }
}
