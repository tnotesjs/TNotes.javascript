// index.js

// 静态导入
import * as dynamicModule1 from './dynamicModule1.js';
import * as dynamicModule2 from './dynamicModule2.js';

const random = Math.random();

console.log('[random]:', random);

if (random > 0.5) {
  dynamicModule1.greet();
} else {
  dynamicModule2.greet();
}


// 动态导入
// (async () => {
//   const random = Math.random();

//   console.log('[random]:', random);

//   if (random > 0.5) {
//     const module = await import('./dynamicModule1.js');
//     module.greet();
//   } else {
//     const module = await import('./dynamicModule2.js');
//     module.greet();
//   }
// })();