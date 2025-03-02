/*
由于 null 是一个特殊值，表示一个空对象指针
所以 typeof null 得到的结果是 object
我们没有办法单独使用 typeof 来判断一个值是否是 null 类型
如果结合 instanceof 的话，就可以判断一个值是否是 null 类型

如果 typeof x === 'object' 意味着 x 是一个对象类型，但是我们并不知道 x 是不是 null
所以我们可以使用 instanceof 来判断，如果 x instanceof Object 为 false，那么 x 一定是 null
*/
function isNull(val) {
  if (typeof val === 'object' && !(val instanceof Object)) {
    console.log('val is null')
  } else {
    console.log('val is not null')
  }
}

isNull(null)
// val is null

isNull({})
// val is not null

isNull([])
// val is not null

isNull(Object.create(null))
// val is null
// 特殊情况：
// 如果对象是可以使用 Object.create() 创建的，那么可以绕过上述的判定。