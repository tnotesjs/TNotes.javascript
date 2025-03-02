var longString = 'Long \
long \
long \
string';

console.log(longString) // "Long long long string"

// 加了反斜杠以后，原来写在一行的字符串，可以分成多行书写。
// 但是，输出的时候还是单行，效果与写在同一行完全一样。
// 注意，反斜杠的后面必须是换行符，而不能有其他字符（比如空格），否则会报错。