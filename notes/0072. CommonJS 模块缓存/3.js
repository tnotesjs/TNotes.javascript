// 3.js
console.log('before load [require]:', require) // cache 字段不包含 myModule
console.log('before load [module]:', module) // children 字段不包含 myModule

require('./myModule')

console.log('[require]:', require) // cache 字段包含 myModule
console.log('[module]:', module) // children 字段包含 myModule