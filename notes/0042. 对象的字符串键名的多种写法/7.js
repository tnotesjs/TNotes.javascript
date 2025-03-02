// 对象的属性名可以是非法标识符
const user = {
  'graduate date': '2022-06',
  'home address': {
    province: '浙江',
    city: '温州',
  },
}

console.log(user['graduate date'])
// => 2022-06

console.log(user['home address'])
// => { province: '浙江', city: '温州' }
