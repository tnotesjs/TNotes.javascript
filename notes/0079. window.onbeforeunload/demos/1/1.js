window.addEventListener('beforeunload', function (event) {
  if (thereIsUnsavedWork()) {
    const message = '您确定要离开此页面吗？未保存的数据将会丢失。'
    event.returnValue = message
    return message
  }
})

function thereIsUnsavedWork() {
  console.log('检查是否有未保存的工作')

  // 有未保存的工作
  // return true

  // 没有未保存的工作
  return false
}
