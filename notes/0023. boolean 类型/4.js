// 空数组（[]）和空对象（{}）对应的布尔值，都是true。
console.log(!![]) // true
console.log(!!{}) // true

if ([]) {
  console.log('true');
}
// true

if ({}) {
  console.log('true');
}
// true