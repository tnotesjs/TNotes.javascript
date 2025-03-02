import pkg from './package.json' assert { type: 'json' }
console.log(typeof pkg) // => object
console.log(pkg.version) // => 1.0.0