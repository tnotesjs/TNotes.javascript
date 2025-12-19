/**
 * 用于测试的 API
 *
 * doc:
 * https://jsonplaceholder.typicode.com
 *
 * 1. https://jsonplaceholder.typicode.com/posts
 * 获取 100 条帖子数据 - 模拟较大数据量
 *
 * 2. https://jsonplaceholder.typicode.com/comments
 * 获取 500 条评论数据 - 模拟更大数据量
 *
 * 可以使用浏览器直接访问 1、2，查看接口的响应数据内容。
 */
const API_URL = 'https://jsonplaceholder.typicode.com/comments'

// 页面加载提示
console.log(`
🎯 示例说明：
1. 点击左侧按钮：演示传统 fetch().json()，必须等待完整响应
2. 点击右侧按钮：演示流式处理，可以边接收边处理
3. 观察"首次数据到达时间"的差异

📝 关键区别：
- 传统方式：等待全部数据 → 一次性显示
- 流式处理：数据到达即显示 → 更好的用户体验
`)
