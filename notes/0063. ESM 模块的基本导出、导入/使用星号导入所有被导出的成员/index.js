// index.js
import * as a from './a.js'; // 若使用了 * 则必须使用 as 关键字，对导入的成员重命名。

console.log(typeof a); // => object { sex: 'male', name: 'dahuyou' }
console.log(a.sex, a.name); // => male dahuyou