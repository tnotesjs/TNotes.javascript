import config from './config.json' assert { type: 'json' }
console.log(typeof config) // => object
console.log(config) // => { a: 1, b: 2, c: { msg: 'hello world' } }

// (node:69126) ExperimentalWarning: Importing JSON modules is an experimental feature and might change at any time
// (Use `node --trace-warnings ...` to show where the warning was created)