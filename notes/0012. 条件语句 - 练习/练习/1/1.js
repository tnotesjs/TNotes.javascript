var number = 130

if (isNaN(number) || number < 100 || number > 999) {
  console.log('输入有误')
} else {
  if (number % 13 === 0) {
    console.log('能被13整除')
  } else {
    console.log('不能被13整除')
  }
}
