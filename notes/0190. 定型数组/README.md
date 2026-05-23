# [0190. 定型数组](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0190.%20%E5%AE%9A%E5%9E%8B%E6%95%B0%E7%BB%84)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么 JavaScript 还需要定型数组？](#3--为什么-javascript-还需要定型数组)
- [4. 🤔 `ArrayBuffer`、`DataView` 和定型数组是什么关系？](#4--arraybufferdataview-和定型数组是什么关系)
- [5. 🤔 常见定型数组应该怎样创建？](#5--常见定型数组应该怎样创建)
- [6. 🤔 定型数组和普通数组最关键的差异是什么？](#6--定型数组和普通数组最关键的差异是什么)
- [7. 🤔 `DataView`、`set()` 和 `subarray()` 分别适合什么场景？](#7--dataviewset-和-subarray-分别适合什么场景)
- [8. 🤔 什么时候该用定型数组，什么时候不该用？](#8--什么时候该用定型数组什么时候不该用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 定型数组出现的背景
- `ArrayBuffer`、`DataView` 与定型数组的关系
- 常见定型数组的创建方式
- 定型数组和普通数组的差异
- `set()`、`subarray()` 等常见操作
- 适用场景与边界

## 2. 🫧 评价

- 定型数组不是“性能版数组”这么简单，它更像是 JavaScript 进入二进制世界的一张门票。只要你理解了缓冲区、视图和元素类型这三个概念，这部分内容就不会再显得神秘。

## 3. 🤔 为什么 JavaScript 还需要定型数组？

因为普通数组太灵活了，灵活到不适合直接和底层二进制数据打交道。

定型数组诞生的核心背景，是浏览器需要更高效地和图形、网络、文件等底层数据格式交换数值数据，尤其是 WebGL 这类场景。

普通数组里的元素默认是 JavaScript 的通用数值语义，而底层系统往往更在乎固定字节宽度、字节序和内存布局。定型数组就是为了解决这个错位而出现的。

## 4. 🤔 `ArrayBuffer`、`DataView` 和定型数组是什么关系？

可以把三者理解成下面这层关系：

- `ArrayBuffer`：一块原始内存缓冲区。
- `DataView`：对这块缓冲区进行灵活读写的通用视图。
- 定型数组：按固定元素类型去看这块缓冲区的专用视图。

例如：

```js
const buffer = new ArrayBuffer(16)
const view = new DataView(buffer)
const ints = new Int32Array(buffer)
```

这里三者可以指向同一块底层内存，但观察和读写这块内存的方式不同。

`DataView` 更灵活，适合自己控制偏移量和字节序；定型数组更高效，适合批量处理固定数值类型。

## 5. 🤔 常见定型数组应该怎样创建？

常见方式主要有四类。

第一类，基于已有 `ArrayBuffer`：

```js
const buffer = new ArrayBuffer(12)
const ints = new Int32Array(buffer)
```

第二类，直接按长度创建：

```js
const ints = new Int32Array(6)
```

第三类，基于普通数组或可迭代对象：

```js
const ints = new Int16Array([2, 4, 6, 8])
```

第四类，使用 `from()` 或 `of()`：

```js
const ints = Int16Array.from([3, 5, 7, 9])
const floats = Float32Array.of(3.14, 2.718)
```

无论哪种方式，定型数组的核心前提都没变：它里面的每个元素都按固定字节宽度和固定类型解释。

## 6. 🤔 定型数组和普通数组最关键的差异是什么？

最关键的差异有四个。

第一，只适合数值数据。

第二，底层依赖固定大小的缓冲区，因此很多普通数组上的动态修改方法都不适用，比如：

- `push()`
- `pop()`
- `shift()`
- `unshift()`
- `splice()`
- `concat()`

第三，定型数组更强调元素类型，比如 `Int8Array`、`Uint8Array`、`Float32Array`。

第四，它更适合和二进制协议、底层 API、图形计算一起使用，而不是拿来装普通业务列表。

## 7. 🤔 `DataView`、`set()` 和 `subarray()` 分别适合什么场景？

`DataView` 适合你需要自己精确控制读写方式的场景，比如按字节偏移读取，或者指定大端 / 小端字节序。

```js
const buffer = new ArrayBuffer(2)
const view = new DataView(buffer)

view.setUint8(0, 0x80)
view.setUint8(1, 0x01)

console.log(view.getUint16(0))
console.log(view.getUint16(0, true))
```

定型数组上的 `set()` 适合把一批值快速写进现有定型数组：

```js
const container = new Int16Array(8)
container.set([1, 2, 3, 4])
container.set([5, 6, 7, 8], 4)
```

`subarray()` 适合按范围取出同类型的新视图片段：

```js
const source = Int16Array.of(2, 4, 6, 8)
const partial = source.subarray(1, 3)
console.log(partial)
```

## 8. 🤔 什么时候该用定型数组，什么时候不该用？

你应该考虑定型数组的场景通常是：

- 处理二进制协议
- 与 WebGL、音视频、文件流等底层接口交互
- 明确知道自己要管理固定宽度数值

你不该优先用定型数组的场景通常是：

- 普通业务数据列表
- 需要频繁增删元素的集合
- 希望像普通数组一样随时拼接、截断、重排结构的数据

简单来说，定型数组关注的是“内存里的数值长什么样”，普通数组关注的是“代码里的列表怎么用起来顺手”。
