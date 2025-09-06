/**
 * 自定义 confirm 函数
 * @param {string} title - 对话框标题
 * @param {string} message - 对话框内容
 * @param {Object} options - 可选配置 { confirmText, cancelText }
 * @returns {Promise<boolean>} 用户是否确认
 */
function customConfirm(
  title = '确认操作',
  message = '你确定要执行此操作吗？',
  options = {}
) {
  const { confirmText = '确定', cancelText = '取消' } = options

  // 返回一个 Promise，以便异步使用
  return new Promise((resolve) => {
    // 创建遮罩层
    const overlay = document.createElement('div')
    overlay.className = 'custom-confirm-overlay'

    // 创建对话框
    const dialog = document.createElement('div')
    dialog.className = 'custom-confirm'

    dialog.innerHTML = `
          <h3>${title}</h3>
          <p>${message}</p>
          <div class="custom-confirm-buttons">
            <button class="custom-confirm-button cancel" data-action="cancel">${cancelText}</button>
            <button class="custom-confirm-button confirm" data-action="confirm">${confirmText}</button>
          </div>
        `

    // 添加事件监听
    dialog
      .querySelector('[data-action="cancel"]')
      .addEventListener('click', () => {
        overlay.remove()
        resolve(false)
      })

    dialog
      .querySelector('[data-action="confirm"]')
      .addEventListener('click', () => {
        overlay.remove()
        resolve(true)
      })

    // 点击遮罩层关闭（可选）
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove()
        resolve(false)
      }
    })

    // 组装
    overlay.appendChild(dialog)
    document.body.appendChild(overlay)
  })
}
