# [0280. 表单基础](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0280.%20%E8%A1%A8%E5%8D%95%E5%9F%BA%E7%A1%80)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 表单在 JavaScript 中是什么对象？](#3-表单在-javascript-中是什么对象)
- [4. 表单提交有哪些方式？](#4-表单提交有哪些方式)
- [5. 如何避免重复提交？](#5-如何避免重复提交)
- [6. 表单重置有什么特点？](#6-表单重置有什么特点)
- [7. 如何访问表单字段？](#7-如何访问表单字段)
- [8. 表单字段有哪些公共能力？](#8-表单字段有哪些公共能力)
- [9. 表单字段有哪些公共事件？](#9-表单字段有哪些公共事件)

<!-- endregion:toc -->

## 1. 本节内容

- `HTMLFormElement` 的属性和方法
- 获取表单引用的几种方式
- 表单提交与重置的事件差异
- 表单字段集合 `elements`
- 表单字段的公共属性、方法和事件

## 2. 评价

- 表单基础最值得记住的是事件时机：用户触发提交、脚本调用 `submit()`、用户点击重置和脚本调用 `reset()` 的行为并不完全对称。

## 3. 表单在 JavaScript 中是什么对象？

HTML 中的 `<form>` 元素在 JavaScript 中对应 `HTMLFormElement`。它继承自 `HTMLElement`，所以拥有普通元素的属性和方法，同时也有表单专属能力。

常用属性和方法包括：

| 属性或方法      | 作用                                            |
| --------------- | ----------------------------------------------- |
| `acceptCharset` | 服务器可以接收的字符集，对应 `accept-charset`。 |
| `action`        | 表单提交目标 URL。                              |
| `elements`      | 表单中所有控件组成的 `HTMLCollection`。         |
| `enctype`       | 请求编码类型。                                  |
| `length`        | 表单控件数量。                                  |
| `method`        | 提交使用的 HTTP 方法，通常是 `get` 或 `post`。  |
| `name`          | 表单名称。                                      |
| `reset()`       | 把字段恢复为默认值。                            |
| `submit()`      | 以脚本方式提交表单。                            |
| `target`        | 响应要打开到的窗口或上下文。                    |

取得表单最常见的方式是给表单设置 `id`，然后使用 DOM 查询：

```js
const form = document.getElementById('signupForm')
```

也可以通过 `document.forms` 访问页面上的表单：

```js
const firstForm = document.forms[0]
const loginForm = document.forms['login']
```

历史上，浏览器还允许通过 `document.formName` 访问表单，但这种方式容易和文档对象的属性冲突，不推荐使用。

## 4. 表单提交有哪些方式？

用户提交表单通常有三种入口：

- 点击 `<input type="submit">`。
- 点击 `<button type="submit">`。
- 点击 `<input type="image">`。

如果表单中有提交按钮，并且焦点在某个表单控件中，用户按回车键也可能触发表单提交。不过 `<textarea>` 例外，它通常会把回车作为换行输入。

用户触发表单提交时，浏览器会先触发 `submit` 事件。你可以在这个事件中验证数据，并通过 `event.preventDefault()` 阻止真正提交。

```js
const form = document.getElementById('signupForm')

form.addEventListener('submit', (event) => {
  if (!form.checkValidity()) {
    event.preventDefault()
  }
})
```

也可以通过脚本调用 `submit()` 提交表单：

```js
const form = document.getElementById('signupForm')

if (validateForm(form)) {
  form.submit()
}
```

这里有一个非常重要的区别：调用 `form.submit()` 不会触发 `submit` 事件。因此，如果你依赖 `submit` 事件做验证或同步数据，手动提交前必须自己执行这些逻辑。

## 5. 如何避免重复提交？

表单提交后如果页面没有立刻响应，用户可能会连续点击提交按钮，导致重复请求。常见的浏览器端处理方式是在 `submit` 事件中禁用提交按钮。

```js
const form = document.getElementById('orderForm')

form.addEventListener('submit', (event) => {
  const submitButton = event.target.elements['submitButton']

  if (submitButton) {
    submitButton.disabled = true
  }
})
```

这类逻辑应该放在表单的 `submit` 事件中，而不是只放在按钮的 `click` 事件中。不同浏览器历史上对按钮 `click` 和表单 `submit` 的触发顺序存在差异；如果在按钮 `click` 中过早禁用按钮，有可能影响表单正常提交。

不过，前端禁用按钮只是改善体验，不能替代服务端幂等处理。涉及付款、下单、创建资源等操作时，服务端仍然需要防重复提交。

## 6. 表单重置有什么特点？

重置按钮可以通过 `<input type="reset">` 或 `<button type="reset">` 创建。用户点击后，表单字段会恢复到页面初始渲染时的默认值。

用户触发重置时会触发 `reset` 事件，因此可以取消：

```js
const form = document.getElementById('profileForm')

form.addEventListener('reset', (event) => {
  const confirmed = window.confirm('确定要清空当前修改吗？')

  if (!confirmed) {
    event.preventDefault()
  }
})
```

脚本也可以调用 `reset()`：

```js
form.reset()
```

和 `submit()` 不同，调用 `reset()` 会触发 `reset` 事件。

实际产品中，重置表单并不常见。它容易让用户误删已经输入的内容。很多场景中，取消编辑、返回上一页或恢复某个字段的默认值，会比整体重置更清楚。

## 7. 如何访问表单字段？

表单字段可以像普通 DOM 元素一样查询，也可以通过表单的 `elements` 集合访问。`elements` 按字段在 HTML 中出现的顺序保存控件，包括 `input`、`textarea`、`button`、`select` 和 `fieldset` 等。

```js
const form = document.getElementById('signupForm')

const firstField = form.elements[0]
const emailField = form.elements['email']
const fieldCount = form.elements.length
```

如果多个字段使用同一个 `name`，例如一组单选按钮，那么通过该名字访问时会得到一个集合。

```html
<form id="colorForm">
  <label><input type="radio" name="color" value="red" /> 红色</label>
  <label><input type="radio" name="color" value="green" /> 绿色</label>
  <label><input type="radio" name="color" value="blue" /> 蓝色</label>
</form>
```

```js
const form = document.getElementById('colorForm')
const colorFields = form.elements['color']

console.log(colorFields.length)
console.log(colorFields[0] === form.elements[0])
```

表单对象也支持 `form[0]` 或 `form['color']` 这种访问方式，但为了清晰，实际开发中优先使用 `form.elements`。

## 8. 表单字段有哪些公共能力？

除 `fieldset` 外，大多数表单字段都有一组公共属性：

| 属性       | 作用                                         |
| ---------- | -------------------------------------------- |
| `disabled` | 字段是否禁用。禁用字段不会随表单提交。       |
| `form`     | 字段所属表单，只读。                         |
| `name`     | 字段名。提交和序列化都依赖它。               |
| `readOnly` | 字段是否只读。                               |
| `tabIndex` | Tab 键切换顺序。                             |
| `type`     | 字段类型，例如 `text`、`checkbox`、`radio`。 |
| `value`    | 字段值。文件输入的值通常只读。               |

```js
const field = document.forms[0].elements[0]

field.value = '新的值'
console.log(field.form === document.forms[0])
field.disabled = true
```

表单字段还有两个公共方法：`focus()` 和 `blur()`。`focus()` 让字段获得焦点，`blur()` 移除焦点。

```js
window.addEventListener('load', () => {
  const firstField = document.forms[0].elements[0]

  if (firstField && firstField.autofocus !== true) {
    firstField.focus()
  }
})
```

HTML5 提供了 `autofocus` 属性，支持的浏览器会自动把焦点放到对应字段上。脚本设置焦点前最好先尊重这个属性。

## 9. 表单字段有哪些公共事件？

表单字段常见公共事件包括：

| 事件     | 触发时机                       |
| -------- | ------------------------------ |
| `focus`  | 字段获得焦点时。               |
| `blur`   | 字段失去焦点时。               |
| `change` | 字段值改变并在特定时机确认时。 |

`focus` 和 `blur` 比较直接，用户切换焦点或脚本调用 `focus()`、`blur()` 都可能触发。`change` 的行为要看控件类型：文本框通常在值改变并失去焦点后触发，选择框通常在选中项改变时立即触发。

```js
const textbox = document.forms[0].elements['age']

textbox.addEventListener('focus', (event) => {
  const field = event.target

  if (field.style.backgroundColor !== 'red') {
    field.style.backgroundColor = 'yellow'
  }
})

textbox.addEventListener('blur', validateNumber)
textbox.addEventListener('change', validateNumber)

function validateNumber(event) {
  const field = event.target

  field.style.backgroundColor = /[^\d]/.test(field.value) ? 'red' : ''
}
```

不要依赖 `blur` 和 `change` 的先后顺序。不同浏览器历史上触发顺序并不完全一致，验证逻辑最好写成可重复执行的独立函数。
