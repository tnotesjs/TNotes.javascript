// a.js
export const a = 1;
function method () {
  console.log('this is a method.');
}
export default method; // 等效：export {method as default};