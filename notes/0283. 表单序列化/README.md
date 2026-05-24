# [0283. 表单序列化](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0283.%20%E8%A1%A8%E5%8D%95%E5%BA%8F%E5%88%97%E5%8C%96)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 表单序列化是什么？](#3--表单序列化是什么)
- [4. 🤔 浏览器提交表单时会发送哪些字段？](#4--浏览器提交表单时会发送哪些字段)
- [5. 🤔 如何手写一个表单序列化函数？](#5--如何手写一个表单序列化函数)
- [6. 🤔 多选字段为什么会出现多个同名值？](#6--多选字段为什么会出现多个同名值)
- [7. 🤔 什么时候用 `FormData` 更合适？](#7--什么时候用-formdata-更合适)
- [8. 🤔 表单序列化有哪些注意事项？](#8--表单序列化有哪些注意事项)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 表单提交时浏览器发送字段的规则
- 不同表单控件的序列化差异
- 手写 `serialize(form)` 的核心流程
- `FormData` 与手写序列化的取舍

## 2. 🫧 评价

- 表单序列化的关键不是拼字符串，而是忠实模拟浏览器提交规则；哪些字段应该跳过，往往比怎么编码更重要。

## 3. 🤔 表单序列化是什么？

表单序列化就是把表单中的字段转换成可以提交或传输的数据格式。Ajax 流行后，开发者经常需要在不刷新页面的情况下提交表单，这时就需要用 JavaScript 收集字段名和值。

最常见的序列化结果是查询字符串：

```txt
username=alice&email=alice%40example.com&color=red
```

要做好这件事，不能只遍历字段并读取 `value`。浏览器提交表单时有一套规则，序列化函数应该尽量模拟这些规则。

## 4. 🤔 浏览器提交表单时会发送哪些字段？

表单提交时，字段名和值通常会进行 URL 编码，并用 `&` 连接。除此之外，还有这些规则：

- 禁用字段不会提交。
- 没有 `name` 的字段不会提交。
- 复选框和单选按钮只有在被选中时才提交。
- `reset`、`button` 这类按钮不会提交。
- 文件字段通常不适合序列化成查询字符串。
- 多选选择框中，每个被选中的选项都会产生一个同名字段。
- 点击提交按钮提交表单时，该提交按钮也会提交；脚本序列化通常会跳过按钮。
- `<select>` 的值来自被选中 `<option>` 的 `value`，没有 `value` 时才使用选项文本。

这些规则解释了为什么表单序列化函数需要看字段的 `type`、`name`、`disabled`、`checked`、`options` 等多个属性。

## 5. 🤔 如何手写一个表单序列化函数？

下面是一个按浏览器提交规则组织的基础版本，返回查询字符串。

```js
function serialize(form) {
  const parts = []

  for (const field of form.elements) {
    if (!field.name || field.disabled) continue

    switch (field.type) {
      case 'select-one':
      case 'select-multiple': {
        for (const option of field.options) {
          if (!option.selected) continue

          const optionValue = option.hasAttribute('value')
            ? option.value
            : option.text

          parts.push(
            `${encodeURIComponent(field.name)}=${encodeURIComponent(optionValue)}`,
          )
        }
        break
      }

      case 'radio':
      case 'checkbox':
        if (!field.checked) break
        parts.push(
          `${encodeURIComponent(field.name)}=${encodeURIComponent(field.value)}`,
        )
        break

      case 'file':
      case 'submit':
      case 'reset':
      case 'button':
      case undefined:
        break

      default:
        parts.push(
          `${encodeURIComponent(field.name)}=${encodeURIComponent(field.value)}`,
        )
    }
  }

  return parts.join('&')
}
```

这个函数做了几件事：

- 跳过没有名字或被禁用的字段。
- 对单选和多选选择框逐个检查选项。
- 对单选按钮和复选框只序列化已选中的项。
- 跳过按钮、文件字段和 `fieldset`。
- 使用 `encodeURIComponent()` 编码字段名和值。

如果要兼容非常旧的 IE，判断选项是否显式拥有 `value` 属性时还需要考虑 `option.attributes.value.specified`。现代代码通常可以使用 `hasAttribute('value')`。

## 6. 🤔 多选字段为什么会出现多个同名值？

多选选择框可能有多个选中项，因此序列化结果会包含多个同名字段。

```html
<select name="colors" multiple>
  <option value="red" selected>红色</option>
  <option value="green" selected>绿色</option>
  <option value="blue">蓝色</option>
</select>
```

序列化后可能得到：

```txt
colors=red&colors=green
```

这和浏览器原生提交行为一致。服务器端应该按同名字段集合来处理，而不是假设每个字段名只有一个值。

复选框组也常出现同名多值：

```html
<label><input type="checkbox" name="hobby" value="music" checked /> 音乐</label>
<label
  ><input type="checkbox" name="hobby" value="sports" checked /> 运动</label
>
```

结果会类似：

```txt
hobby=music&hobby=sports
```

## 7. 🤔 什么时候用 `FormData` 更合适？

现代浏览器提供了 `FormData`，它会按浏览器规则收集表单数据，尤其适合和 `fetch()` 一起提交。

```js
const form = document.getElementById('profileForm')
const formData = new FormData(form)

await fetch('/api/profile', {
  method: 'POST',
  body: formData,
})
```

如果你需要查询字符串，也可以把 `FormData` 转成 `URLSearchParams`。

```js
const params = new URLSearchParams(new FormData(form))

console.log(params.toString())
```

手写序列化函数的价值在于理解规则，以及处理一些需要自定义输出格式的场景。实际项目中，如果目标浏览器支持，优先使用 `FormData` 通常更稳，尤其是涉及文件上传时。

## 8. 🤔 表单序列化有哪些注意事项？

第一，不要序列化禁用字段。`disabled` 字段不会被浏览器提交，如果你手写函数把它带上，可能会和原生行为不一致。

第二，不要忘记字段名。没有 `name` 的控件只参与页面交互，不会成为提交数据的一部分。

第三，文件字段不能简单变成查询字符串。文件上传应该交给原生表单提交或 `FormData`。

第四，序列化不是安全措施。即使浏览器端跳过了某些字段、过滤了某些值，用户仍然可以伪造请求。服务器必须重新验证所有输入。
