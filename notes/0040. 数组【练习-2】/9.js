var len = +prompt("请输入斐波拉契数列的长度");
if (isNaN(len) || len < 0) {
  console.log("输入有误");
} else {
  //输入正确
  var arr = [];
  for (var i = 0; i < len; i++) {
    if (i === 0 || i === 1) {
      arr[i] = 1;
    } else {
      arr[i] = arr[i - 1] + arr[i - 2];
    }
  }

  console.log(arr);
}