var obj = {};
console.log(obj.toString) // function toString() { [native code] }
console.log('是否删除成功：', isDeleted) // 是否删除成功：true
console.log(obj.toString) // function toString() { [native code] }

// delete 命令只能删除 对象本身 的属性，无法删除 继承 的属性。

// 上面代码中，toString 是对象 obj 继承的属性，
// 虽然 delete 命令返回 true，但该属性并没有被删除，依然存在。

// 这个例子还说明，即使 delete 返回 true，该属性依然可能读取到值。