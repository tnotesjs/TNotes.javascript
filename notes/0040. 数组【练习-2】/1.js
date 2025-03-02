var arr1 = [3, 5, 7, 8, 2] // arr1 中存放的是地址
var arr2 = arr1 // arr2 中存放的是地址
arr2[0] = 5
console.log(arr1 === arr2) // => true
console.log(arr1[0], arr2[0]) // => 5 5

// 由于数组本质上就是一个对象，数组的变量名存放的是该引用类型的地址，
// \赋值时，赋的也就是地址，即：在这个案例中 arr1、arr2 指向的是同一块内存空间。
