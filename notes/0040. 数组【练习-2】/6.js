var arr = [3, 4, 6, 1, 3]

var str = ''
for (var i = 0; i < arr.length; i++) {
  str += arr[i]
  if (i < arr.length - 1) {
    str += ', '
  }
}

console.log(str) // => "3, 4, 6, 1, 3"
console.log(arr.join(', ')) // => "3, 4, 6, 1, 3"

