// util.js
/**
 * 将一个数组的内容打乱
 * @param {Array} arr 数组
 */
const sortRandom = (arr) => {
  arr.sort((_) => Math.random() - 0.5)
}

module.exports = {
  sortRandom,
}