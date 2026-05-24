# [0282. 选择框编程](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0282.%20%E9%80%89%E6%8B%A9%E6%A1%86%E7%BC%96%E7%A8%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 选择框有哪些专属属性和方法？](#3--选择框有哪些专属属性和方法)
- [4. 🤔 选择框的 `value` 是怎么计算的？](#4--选择框的-value-是怎么计算的)
- [5. 🤔 如何获取选中的选项？](#5--如何获取选中的选项)
- [6. 🤔 如何动态添加选项？](#6--如何动态添加选项)
- [7. 🤔 如何移除和清空选项？](#7--如何移除和清空选项)
- [8. 🤔 如何移动和重排选项？](#8--如何移动和重排选项)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `HTMLSelectElement` 的属性和方法
- `<select>` 的 `value` 计算规则
- `HTMLOptionElement` 的常用属性
- 单选和多选选择框的选项处理
- 动态添加、移除、移动和重排选项

## 2. 🫧 评价

- 选择框编程的重点不是会不会改 DOM，而是要理解选中状态和值的规则；一旦规则清楚，添加、删除和移动选项都只是机械操作。

## 3. 🤔 选择框有哪些专属属性和方法？

选择框由 `<select>` 和 `<option>` 创建。`HTMLSelectElement` 在普通表单字段能力之外，还提供了一组选择框专属属性和方法。

| 属性或方法 | 作用 |
| --- | --- |
| `add(newOption, referenceOption)` | 在参考选项前添加新选项。 |
| `multiple` | 是否允许多选。 |
| `options` | 所有 `<option>` 组成的 `HTMLCollection`。 |
| `remove(index)` | 移除指定索引的选项。 |
| `selectedIndex` | 第一个选中项的索引，没有选中项时为 `-1`。 |
| `size` | 可见行数。 |

选择框的 `type` 可能是 `select-one` 或 `select-multiple`，取决于是否存在 `multiple` 属性。

```html
<select name="location" id="location">
  <option value="sunnyvale">Sunnyvale</option>
  <option value="los-angeles">Los Angeles</option>
  <option value="mountain-view">Mountain View</option>
</select>
```

```js
const selectbox = document.getElementById('location')

console.log(selectbox.type)
console.log(selectbox.options.length)
console.log(selectbox.selectedIndex)
```

选择框的 `change` 事件和文本框不同。文本框通常在失去焦点后触发 `change`，选择框一般会在用户改变选中项时立即触发。

## 4. 🤔 选择框的 `value` 是怎么计算的？

选择框的 `value` 来自当前选中的 `<option>`。规则如下：

- 没有选中项时，值是空字符串。
- 选中项有 `value` 属性时，值就是该属性的值，即使它是空字符串。
- 选中项没有 `value` 属性时，值通常是选项文本。
- 多选时，`value` 返回第一个选中项按上述规则得到的值。

```html
<select name="country" id="country">
  <option value="cn">中国</option>
  <option value="">未指定</option>
  <option>Australia</option>
</select>
```

如果选择第一项，`selectbox.value` 是 `cn`。如果选择第二项，值是空字符串。如果选择第三项，现代浏览器通常返回 `Australia`。

每个 `<option>` 对应 `HTMLOptionElement`，常用属性包括：

| 属性       | 作用                            |
| ---------- | ------------------------------- |
| `index`    | 选项在 `options` 集合中的索引。 |
| `label`    | 选项标签。                      |
| `selected` | 是否被选中。                    |
| `text`     | 选项显示文本。                  |
| `value`    | 选项值。                        |

读写选项文本和值时，优先使用这些专属属性，而不是操作文本节点或 HTML 属性。

```js
const option = selectbox.options[0]

console.log(option.text)
console.log(option.value)
```

## 5. 🤔 如何获取选中的选项？

单选选择框中，可以使用 `selectedIndex` 获取选中项：

```js
const selectedIndex = selectbox.selectedIndex
const selectedOption = selectbox.options[selectedIndex]

console.log(selectedOption.text)
console.log(selectedOption.value)
```

多选选择框中，`selectedIndex` 仍然只返回第一个选中项。要获取所有选中项，需要遍历 `options` 并检查每个选项的 `selected`。

```js
function getSelectedOptions(selectbox) {
  const selectedOptions = []

  for (const option of selectbox.options) {
    if (option.selected) {
      selectedOptions.push(option)
    }
  }

  return selectedOptions
}
```

选中某个选项可以设置它的 `selected` 属性：

```js
selectbox.options[0].selected = true
```

在单选选择框中，这会取消其他选项的选中状态。在多选选择框中，这不会自动取消其他已选选项。

## 6. 🤔 如何动态添加选项？

添加选项有几种方式。第一种是使用 DOM 创建 `<option>`：

```js
const option = document.createElement('option')

option.text = 'Option text'
option.value = 'Option value'

selectbox.appendChild(option)
```

第二种是使用 `Option` 构造函数：

```js
const option = new Option('Option text', 'Option value')

selectbox.appendChild(option)
```

第三种是使用选择框的 `add()` 方法。跨浏览器添加到末尾时，可以把第二个参数写成 `undefined`。

```js
const option = new Option('Option text', 'Option value')

selectbox.add(option, undefined)
```

如果要插入到某个选项之前，现代浏览器可以把参考选项作为第二个参数。更通用的 DOM 写法是直接使用 `insertBefore()`。

```js
selectbox.insertBefore(option, selectbox.options[1])
```

## 7. 🤔 如何移除和清空选项？

移除选项也有多种方式。

```js
selectbox.removeChild(selectbox.options[0])
selectbox.remove(0)
selectbox.options[0] = null
```

实际开发中，`remove(index)` 最直接，DOM 方式也很清晰。把 `options[index]` 设为 `null` 属于历史兼容写法。

清空所有选项时，可以持续移除第一项：

```js
function clearSelectbox(selectbox) {
  while (selectbox.options.length > 0) {
    selectbox.remove(0)
  }
}
```

之所以每次都移除索引 `0`，是因为移除一项后，后面的选项会自动前移。

## 8. 🤔 如何移动和重排选项？

DOM 有一个很有用的特性：把一个已经存在于文档中的节点插入到新位置时，它会先从旧位置移除，再插入新位置。因此，移动选项不需要重新创建。

```js
const source = document.getElementById('sourceLocations')
const target = document.getElementById('targetLocations')

target.appendChild(source.options[0])
```

这段代码会把 `source` 中的第一项移动到 `target` 的末尾。移动后，相关选项的 `index` 会重新计算。

在同一个选择框中重排选项，可以使用 `insertBefore()`。

```js
function moveOptionUp(selectbox, index) {
  if (index <= 0) return

  const option = selectbox.options[index]
  const previousOption = selectbox.options[index - 1]

  selectbox.insertBefore(option, previousOption)
}

function moveOptionDown(selectbox, index) {
  if (index < 0 || index >= selectbox.options.length - 1) return

  const option = selectbox.options[index]
  const nextNextOption = selectbox.options[index + 2]

  selectbox.insertBefore(option, nextNextOption || null)
}
```

选择框的选项操作基本都可以回到 DOM 节点移动模型来理解：创建、插入、移除、移动。真正要小心的是选中状态和值的同步。
