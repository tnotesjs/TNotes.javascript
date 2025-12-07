// a.js - 默认导出与具名导出并存示例
export const a = 1
function method() {
  console.log('this is a method.')
}
export default method // 等效：export { method as default }
