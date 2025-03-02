var str = (() => { /*
line 1
line 2
line 3
*/}).toString().split('\n').slice(1, -1).join('\n')

console.log(str)
// "line 1
// line 2
// line 3"

// 如果想输出多行字符串，这是一种利用多行注释的变通方法。