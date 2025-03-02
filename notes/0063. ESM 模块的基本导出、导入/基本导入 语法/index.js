// index.js
import { name, age } from './a.js';
// import { b } from './b.js';

console.log(name, age); // => abc 18
console.log(b); // => b

/*
// 下面这种写法是错误写法，但是，并不会报错。
// index.js
import { name, age } from './a.js';

console.log(name, age);
console.log(b);

import { b } from './b.js';

即便 index.js 文件中的代码是这种写法，输出结果依旧不变。这是因为浏览器具备一定的容错能力，可以理解为在预编译阶段，第二个 import 被提升到了代码的最顶端。
*/