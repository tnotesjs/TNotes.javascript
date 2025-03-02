console.log(parseInt('0x10')) // 16
console.log(parseInt('011')) // 11

// 如果字符串以 0x 或 0X 开头，parseInt 会将其按照十六进制数解析。
// 如果字符串以 0 开头，将其按照 10 进制解析。（而非八进制）
