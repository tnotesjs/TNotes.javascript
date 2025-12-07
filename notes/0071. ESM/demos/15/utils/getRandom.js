function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export { getRandom }
console.log('utils/getRandom.js called')
