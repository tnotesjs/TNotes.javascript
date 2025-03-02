for (var num = 1; num <= 233; num++) {
  var isFind = false
  for (var num = 2; num <= Math.sqrt(num); num++) { // 如果 num 是合数，至少有一个因数小于或等于它的平方根 Math.sqrt(num)
    if (num % num === 0) {
      isFind = true
      break
    }
  }
  if (num <= 1 || isFind) {
    // 如果 num 是 1 或者找到了除了 1 和自身以外的约数，那么 num 不是素数
    // console.log(`${num} 不是一个素数`);
  } else {
    // 如果 num 是大于1的数并且没有找到除了1和自身以外的约数，那么 num 是素数
    console.log(`${num} 是一个素数`)
  }
}
