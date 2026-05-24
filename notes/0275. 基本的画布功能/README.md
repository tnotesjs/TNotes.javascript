# [0275. 基本的画布功能](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0275.%20%E5%9F%BA%E6%9C%AC%E7%9A%84%E7%94%BB%E5%B8%83%E5%8A%9F%E8%83%BD)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<canvas>` 元素应该怎么创建？](#3--canvas-元素应该怎么创建)
- [4. 🤔 如何取得绘图上下文？](#4--如何取得绘图上下文)
- [5. 🤔 修改画布尺寸有什么影响？](#5--修改画布尺寸有什么影响)
- [6. 🤔 如何把画布导出成图片？](#6--如何把画布导出成图片)
- [7. 🤔 为什么跨源图片会影响画布导出？](#7--为什么跨源图片会影响画布导出)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `<canvas>` 元素的基本结构
- `width`、`height` 与 CSS 尺寸的区别
- `getContext()` 与 2D 上下文获取
- `toDataURL()` 导出图像
- 跨源图像导致的画布污染问题

## 2. 🫧 评价

- Canvas 入门 API 看起来很少，但这里埋着几个很关键的边界：画布尺寸、上下文能力检测、图像导出和跨源限制，后面 2D 绘图与 WebGL 都绕不开它们。

## 3. 🤔 `<canvas>` 元素应该怎么创建？

创建 `<canvas>` 时，最重要的是设置 `width` 和 `height` 属性。它们决定画布内部实际可绘制区域的像素尺寸。

```html
<canvas id="drawing" width="300" height="150">
  当前浏览器不支持 canvas。
</canvas>
```

开始标签和结束标签之间的内容是后备内容，只会在浏览器不支持 `<canvas>` 时显示。

`width` 和 `height` 可以直接写在 HTML 中，也可以通过 DOM 属性修改：

```js
const canvas = document.querySelector('#drawing')

canvas.width = 600
canvas.height = 300
```

需要注意，`canvas.width` 和 `canvas.height` 改的是绘图缓冲区尺寸；CSS 的 `width` 和 `height` 改的是元素显示尺寸。两者不一致时，浏览器会把内部画布缩放到 CSS 尺寸，可能导致图形模糊或变形。

```css
canvas {
  width: 300px;
  height: 150px;
  border: 1px solid #ccc;
}
```

如果只设置 CSS 尺寸，而不设置元素属性，那么画布内部默认尺寸是 `300 × 150`。

## 4. 🤔 如何取得绘图上下文？

`<canvas>` 本身只是页面元素。要绘图，需要调用 `getContext()` 取得上下文对象。

```js
const canvas = document.querySelector('#drawing')

if (canvas.getContext) {
  const context = canvas.getContext('2d')

  if (context) {
    context.fillStyle = '#0f766e'
    context.fillRect(20, 20, 120, 80)
  }
}
```

这里传入的 `'2d'` 表示取得 2D 绘图上下文。之后所有 2D 绘图操作都通过 `context` 完成。

先检查 `canvas.getContext` 是一个好习惯。历史上，有些浏览器即使不认识 HTML 规范中的新元素，也会把它们创建成普通元素对象。也就是说，变量确实指向了一个元素，但它不一定有绘图能力。

## 5. 🤔 修改画布尺寸有什么影响？

修改 `canvas.width` 或 `canvas.height` 会重置画布。也就是说，画布内容和绘图状态都会被清空，很多上下文属性也会回到默认值。

```js
const canvas = document.querySelector('#drawing')
const context = canvas.getContext('2d')

context.fillStyle = 'tomato'
context.fillRect(0, 0, 100, 100)

canvas.width = 600

// 这里需要重新设置样式并重新绘制
context.fillStyle = 'tomato'
context.fillRect(0, 0, 100, 100)
```

因此，在需要响应容器大小变化时，通常要把重新设置尺寸和重新绘制放在同一套逻辑里。

## 6. 🤔 如何把画布导出成图片？

`toDataURL()` 可以把画布内容导出成数据 URI。它接收一个 MIME 类型参数，例如 `image/png` 或 `image/jpeg`。

```js
const canvas = document.querySelector('#drawing')
const context = canvas.getContext('2d')

context.fillStyle = '#2563eb'
context.fillRect(20, 20, 120, 80)

const imageUri = canvas.toDataURL('image/png')
const image = document.createElement('img')

image.src = imageUri
document.body.append(image)
```

如果不传参数，浏览器默认会导出 PNG。部分浏览器还支持 JPEG 等格式，但最终能否导出指定格式取决于浏览器实现。

导出的结果和你用的是 2D 上下文还是 WebGL 上下文无关，本质上都是把当前画布像素编码成图片。

## 7. 🤔 为什么跨源图片会影响画布导出？

如果画布绘制过跨源图片，并且图片服务器没有正确开启 CORS，那么画布会被标记为已污染。被污染的画布不能再安全地读取像素数据，因此以下操作会抛出错误：

- `canvas.toDataURL()`
- `canvas.toBlob()`
- `context.getImageData()`

```js
const image = new Image()

image.crossOrigin = 'anonymous'
image.src = 'https://example.com/photo.png'

image.addEventListener('load', () => {
  const canvas = document.querySelector('#drawing')
  const context = canvas.getContext('2d')

  context.drawImage(image, 0, 0)
  console.log(canvas.toDataURL('image/png'))
})
```

`crossOrigin = 'anonymous'` 只是告诉浏览器按 CORS 方式请求图片。服务器仍然必须返回允许跨源访问的响应头，否则画布依然会被污染。

这是 Canvas 安全模型中非常重要的一条边界：你可以把很多外部资源画到画布上，但不能随意读取别的站点资源对应的像素数据。
