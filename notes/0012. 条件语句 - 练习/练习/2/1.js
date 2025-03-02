var score = 80

if (isNaN(score) || score < 0 || score > 100) {
  console.log('输入有误')
} else {
  if (score >= 90) {
    console.log('A')
  } else if (score >= 70) {
    console.log('B')
  } else if (score >= 60) {
    console.log('C')
  } else if (score >= 40) {
    console.log('D')
  } else {
    console.log('E')
  }
}
