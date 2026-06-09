# [0281. 文本框编程](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0281.%20%E6%96%87%E6%9C%AC%E6%A1%86%E7%BC%96%E7%A8%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `<input>` 和 `<textarea>` 有什么区别？](#3-input-和-textarea-有什么区别)
- [4. 如何选择文本框中的文本？](#4-如何选择文本框中的文本)
- [5. 如何选择一部分文本？](#5-如何选择一部分文本)
- [6. 如何限制文本框只能输入特定字符？](#6-如何限制文本框只能输入特定字符)
- [7. 剪贴板事件怎么处理？](#7-剪贴板事件怎么处理)
- [8. 自动切换文本框焦点适合什么场景？](#8-自动切换文本框焦点适合什么场景)
- [9. HTML5 约束验证 API 提供了什么？](#9-html5-约束验证-api-提供了什么)

<!-- endregion:toc -->

## 1. 本节内容

- `<input>` 与 `<textarea>` 的区别
- 文本选择、选区范围和选中文本读取
- 输入过滤与剪贴板处理
- 自动切换文本框焦点
- HTML5 约束验证 API

## 2. 评价

- 文本框是表单里最灵活也最容易出问题的控件；与其在提交时一次性兜底，不如从输入、粘贴、选择和验证几个环节逐步收紧。

## 3. `<input>` 和 `<textarea>` 有什么区别？

HTML 中有两种常见文本框：单行文本框使用 `<input>`，多行文本框使用 `<textarea>`。

```html
<input
  type="text"
  name="username"
  size="25"
  maxlength="50"
  value="initial value"
/>

<textarea name="bio" rows="5" cols="25">initial value</textarea>
```

`<input>` 默认类型是 `text`。`size` 表示可见字符宽度，`maxlength` 表示允许输入的最大字符数，`value` 表示初始值。

`<textarea>` 使用 `rows` 和 `cols` 控制可见行列数，初始值写在开始标签和结束标签之间。早期 HTML 中无法直接为 `<textarea>` 指定最大长度，现代浏览器已经支持 `maxlength`，但理解历史差异有助于阅读旧代码。

两者的当前内容都应该通过 `value` 属性读写：

```js
const textbox = document.forms[0].elements['username']

console.log(textbox.value)
textbox.value = 'Some new value'
```

不要用 `setAttribute('value', value)` 或修改 `<textarea>` 的文本节点来处理当前值。表单控件的当前值和 HTML 属性并不是一回事。

## 4. 如何选择文本框中的文本？

文本框支持 `select()` 方法，用来选中全部文本。很多浏览器会在调用后自动让文本框获得焦点。

```js
const textbox = document.forms[0].elements['username']

textbox.select()
```

常见用法是在文本框获得焦点时自动选中默认内容：

```js
textbox.addEventListener('focus', (event) => {
  event.target.select()
})
```

用户选择文本或脚本调用 `select()` 时，会触发 `select` 事件。不过 `select` 事件本身不会告诉你选中了哪一段文本。

```js
textbox.addEventListener('select', () => {
  console.log('用户选择了文本')
})
```

现代浏览器可以通过 `selectionStart` 和 `selectionEnd` 获取选区边界。

```js
function getSelectedText(textbox) {
  return textbox.value.substring(textbox.selectionStart, textbox.selectionEnd)
}
```

这两个属性都是从 `0` 开始的偏移量，和 `substring()` 的参数语义很匹配。

## 5. 如何选择一部分文本？

`setSelectionRange()` 可以选中文本框中的一段内容。它接收选区起点和终点，终点不包含在选区内。

```js
const textbox = document.forms[0].elements['message']

textbox.value = 'Hello world!'
textbox.focus()

textbox.setSelectionRange(0, textbox.value.length)
textbox.setSelectionRange(0, 3)
textbox.setSelectionRange(4, 7)
```

如果想让用户看到选中效果，调用前后都可以让文本框获得焦点。

旧版 IE 使用专有的文本范围 API，例如 `createTextRange()`、`moveStart()`、`moveEnd()` 和 `select()`。这些接口今天主要作为历史兼容知识出现，现代代码优先使用标准的 `selectionStart`、`selectionEnd` 和 `setSelectionRange()`。

部分选中文本常用于自动补全、格式化输入、搜索替换和自定义编辑器。

## 6. 如何限制文本框只能输入特定字符？

文本框默认允许输入任意字符。如果要限制输入内容，可以监听输入相关事件并阻止不符合规则的输入。

原书主要使用 `keypress` 事件示例。现代浏览器里，`keypress` 已经不推荐用于新代码，但理解它有助于阅读旧项目。

```js
textbox.addEventListener('keypress', (event) => {
  const char = String.fromCharCode(event.charCode)

  if (!/\d/.test(char) && event.charCode > 9 && !event.ctrlKey) {
    event.preventDefault()
  }
})
```

这段代码只允许输入数字，同时放过退格、删除、方向键等必要控制键，也避免拦截 `Ctrl+C`、`Ctrl+V` 之类快捷键。

现代代码还可以结合 `beforeinput` 和 `input`：

```js
textbox.addEventListener('beforeinput', (event) => {
  if (event.data && !/^\d+$/.test(event.data)) {
    event.preventDefault()
  }
})

textbox.addEventListener('input', (event) => {
  event.target.value = event.target.value.replace(/\D/g, '')
})
```

`beforeinput` 负责提前阻止，`input` 负责兜底清理。这样可以更好地覆盖输入法、粘贴、拖放等场景。

## 7. 剪贴板事件怎么处理？

与剪贴板相关的事件包括：

| 事件                                     | 作用                           |
| ---------------------------------------- | ------------------------------ |
| `copy`                                   | 复制时触发。                   |
| `cut`                                    | 剪切时触发。                   |
| `paste`                                  | 粘贴时触发。                   |
| `beforecopy`、`beforecut`、`beforepaste` | 历史事件，浏览器支持差异较大。 |

真正阻止复制、剪切或粘贴，需要取消 `copy`、`cut` 或 `paste` 事件的默认行为。

剪贴板数据通常通过事件对象上的 `clipboardData` 访问：

```js
function getClipboardText(event) {
  const clipboardData = event.clipboardData || window.clipboardData

  return clipboardData.getData('text')
}
```

例如，一个只允许数字的文本框还应该检查粘贴内容：

```js
textbox.addEventListener('paste', (event) => {
  const text = getClipboardText(event)

  if (!/^\d*$/.test(text)) {
    event.preventDefault()
  }
})
```

剪贴板访问受浏览器安全策略限制。多数浏览器只允许在剪贴板事件处理期间读取剪贴板内容；异步读写剪贴板则应使用现代 Clipboard API，但那已经属于更后面的 Web API 主题。

## 8. 自动切换文本框焦点适合什么场景？

自动切换常用于固定长度字段，例如分段电话号码、银行卡、验证码。当前字段达到最大长度后，焦点自动进入下一个字段。

```html
<input type="text" name="tel1" id="tel1" maxlength="3" />
<input type="text" name="tel2" id="tel2" maxlength="3" />
<input type="text" name="tel3" id="tel3" maxlength="4" />
```

```js
function tabForward(event) {
  const target = event.target

  if (target.value.length !== target.maxLength) return

  const fields = Array.from(target.form.elements)
  const index = fields.indexOf(target)
  const nextField = fields[index + 1]

  if (nextField) {
    nextField.focus()
  }
}

for (const id of ['tel1', 'tel2', 'tel3']) {
  document.getElementById(id).addEventListener('keyup', tabForward)
}
```

这种交互可以减少用户按 Tab 的次数，但也要谨慎使用。它可能干扰用户修改中间字段，遇到隐藏字段、禁用字段或移动端输入法时也要额外处理。

## 9. HTML5 约束验证 API 提供了什么？

HTML5 约束验证 API 让浏览器可以根据字段属性执行基础验证，即使 JavaScript 没有加载也能工作。

常见约束包括：

| 约束 | 示例 | 作用 |
| --- | --- | --- |
| `required` | `<input required>` | 字段不能为空。 |
| `type="email"` | `<input type="email">` | 要求邮箱格式。 |
| `type="url"` | `<input type="url">` | 要求 URL 格式。 |
| `min` / `max` / `step` | `<input type="number" min="0" max="100" step="5">` | 限制数值范围和步长。 |
| `pattern` | `<input pattern="\d+">` | 要求值匹配指定模式。 |

可以用特性检测判断浏览器是否支持某些能力：

```js
const supportsRequired = 'required' in document.createElement('input')

const input = document.createElement('input')
input.type = 'email'
const supportsEmail = input.type === 'email'
```

`checkValidity()` 可以检查字段或整个表单是否有效：

```js
const form = document.forms[0]
const email = form.elements['email']

if (email.checkValidity()) {
  console.log('邮箱字段有效')
}

if (form.checkValidity()) {
  console.log('整个表单有效')
}
```

字段的 `validity` 属性可以提供更具体的原因：

```js
if (email.validity && !email.validity.valid) {
  if (email.validity.valueMissing) {
    console.log('请输入邮箱')
  } else if (email.validity.typeMismatch) {
    console.log('邮箱格式不正确')
  } else {
    console.log('字段值无效')
  }
}
```

如果需要关闭浏览器默认验证，可以给表单添加 `novalidate`，对应 DOM 属性是 `noValidate`。

```js
document.forms[0].noValidate = true
```

如果只想让某个提交按钮跳过验证，可以使用 `formnovalidate`，对应 DOM 属性是 `formNoValidate`。

约束验证 API 很适合做基础校验，但服务端校验仍然不能省略。浏览器端验证主要服务于体验，不能作为安全边界。
