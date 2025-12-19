// 辅助函数：将字节数组转为十六进制字符串
function arrayToHex(array) {
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ')
}
