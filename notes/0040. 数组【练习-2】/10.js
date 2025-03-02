var users = [
  {
    loginId: 'abc',
    loginPwd: '123',
  },
  {
    loginId: 'abc1',
    loginPwd: '1234',
  },
  {
    loginId: 'abc2',
    loginPwd: '1235',
  },
  {
    loginId: 'abc3',
    loginPwd: '1236',
  },
]

var loginId = prompt('请输入账号')
var loginPwd = prompt('请输入密码')

var isFind = false
for (var i = 0; i < users.length; i++) {
  var u = users[i]
  if (u.loginId === loginId && u.loginPwd === loginPwd) {
    isFind = true
    break
  }
}

if (isFind) {
  console.log('登录成功')
} else {
  console.log('登录失败')
}
