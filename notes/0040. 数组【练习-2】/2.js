var arr1 = [3, 5, 7, 8, 2]
var arr2 = arr1.slice()
arr2[0] = 5
console.log(arr1 === arr2) // => false
console.log(arr1[0], arr2[0]) // => 3 5

// 在这个案例中，arr2 是一个由 arr1 克隆而来的全新的数组，
// arr1、arr2 指向的内存空间不再是同一块了。