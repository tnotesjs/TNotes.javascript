var len = +prompt("请输入数组的长度");
if (isNaN(len) || len < 0) {
  console.log("输入有误");
} else {
  //输入正确
  var arr = []; // var arr = new Array(len);
  for (var i = 0; i < len; i++) {
    // 提示用户输入数组的这一项的值
    arr[i] = prompt("请输入数组第" + (i + 1) + "项的值"); // 若 i + 1 不加括号 那么会先拼接 i 再拼接 1
  }
  console.log(arr);
}