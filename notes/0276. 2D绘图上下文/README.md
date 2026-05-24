# [0276. 2D绘图上下文](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0276.%202D%E7%BB%98%E5%9B%BE%E4%B8%8A%E4%B8%8B%E6%96%87)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 2D 绘图上下文的坐标系统是什么样的？](#3--2d-绘图上下文的坐标系统是什么样的)
- [4. 🤔 填充、描边和矩形怎么绘制？](#4--填充描边和矩形怎么绘制)
- [5. 🤔 如何用路径绘制复杂图形？](#5--如何用路径绘制复杂图形)
- [6. 🤔 文本绘制有哪些关键属性？](#6--文本绘制有哪些关键属性)
- [7. 🤔 变换和状态栈怎么使用？](#7--变换和状态栈怎么使用)
- [8. 🤔 如何绘制图像和处理像素数据？](#8--如何绘制图像和处理像素数据)
- [9. 🤔 阴影、渐变和图案怎么设置？](#9--阴影渐变和图案怎么设置)
- [10. 🤔 透明度和合成方式如何影响最终图形？](#10--透明度和合成方式如何影响最终图形)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 2D 绘图上下文的坐标系统和绘制状态
- 填充、描边、矩形和路径
- 文本、变换、状态保存与恢复
- 图像绘制、阴影、渐变、图案和像素数据
- 全局透明度与图形合成

## 2. 🫧 评价

- 2D 上下文的 API 数量不少，但它们背后其实只有几类问题：画什么、画在哪里、用什么状态画，以及新内容如何和旧内容合成。

## 3. 🤔 2D 绘图上下文的坐标系统是什么样的？

2D 绘图上下文的坐标原点在 `<canvas>` 左上角，坐标 `(0, 0)` 表示画布左上角。`x` 轴向右增长，`y` 轴向下增长。

```js
const canvas = document.querySelector('#drawing')
const context = canvas.getContext('2d')

context.fillRect(0, 0, 100, 60)
```

如果画布的 `width` 是 `300`，`height` 是 `150`，那么默认可绘制区域就是从 `(0, 0)` 到 `(300, 150)`。超出画布范围的绘制会被裁剪。

2D 上下文是状态式 API。很多属性会影响后续绘制，例如：

- `fillStyle`：填充样式。
- `strokeStyle`：描边样式。
- `lineWidth`：线条宽度。
- `font`：文本字体。
- `globalAlpha`：全局透明度。
- 当前变换矩阵：由 `translate()`、`rotate()`、`scale()` 等方法修改。

这些状态会一直保留，直到再次修改或通过 `restore()` 恢复。

## 4. 🤔 填充、描边和矩形怎么绘制？

2D 上下文最基础的绘制操作是填充和描边。填充会把图形内部涂满，描边只绘制图形边界。

```js
const canvas = document.querySelector('#drawing')
const context = canvas.getContext('2d')

context.fillStyle = '#ef4444'
context.fillRect(10, 10, 80, 80)

context.strokeStyle = '#2563eb'
context.lineWidth = 4
context.strokeRect(30, 30, 80, 80)

context.clearRect(55, 55, 20, 20)
```

矩形是 2D 上下文中唯一可以直接绘制的基本形状，相关方法有三个：

| 方法                                   | 作用                           |
| -------------------------------------- | ------------------------------ |
| `fillRect(left, top, width, height)`   | 绘制并填充矩形。               |
| `strokeRect(left, top, width, height)` | 绘制矩形轮廓。                 |
| `clearRect(left, top, width, height)`  | 清除指定矩形区域，让它变透明。 |

描边还会受到 `lineWidth`、`lineCap` 和 `lineJoin` 等属性影响。`lineCap` 控制线段端点，`lineJoin` 控制线段连接点。

## 5. 🤔 如何用路径绘制复杂图形？

除了矩形，复杂图形通常通过路径绘制。路径可以由直线、弧线、贝塞尔曲线和矩形片段组成。

绘制路径的一般步骤是：

1. 调用 `beginPath()` 开始新路径。
2. 使用 `moveTo()`、`lineTo()`、`arc()` 等方法描述路径。
3. 调用 `fill()` 填充路径，或调用 `stroke()` 描边路径。

```js
const canvas = document.querySelector('#drawing')
const context = canvas.getContext('2d')

context.beginPath()
context.arc(100, 100, 80, 0, Math.PI * 2)
context.moveTo(100, 100)
context.lineTo(100, 35)
context.moveTo(100, 100)
context.lineTo(150, 100)
context.stroke()
```

常见路径方法包括：

| 方法 | 作用 |
| --- | --- |
| `moveTo(left, top)` | 移动画笔，不绘制线条。 |
| `lineTo(left, top)` | 从当前位置绘制直线到目标点。 |
| `arc(centerLeft, centerTop, radius, startAngle, endAngle, counterclockwise)` | 绘制圆弧。 |
| `arcTo(left1, top1, left2, top2, radius)` | 通过两个控制点绘制弧线。 |
| `quadraticCurveTo(controlLeft, controlTop, left, top)` | 绘制二次贝塞尔曲线。 |
| `bezierCurveTo(controlLeft1, controlTop1, controlLeft2, controlTop2, left, top)` | 绘制三次贝塞尔曲线。 |
| `rect(left, top, width, height)` | 向当前路径加入矩形。 |

路径创建后，还可以使用 `closePath()` 闭合路径，使用 `clip()` 把当前路径变成剪切区域，使用 `isPointInPath(left, top)` 判断某个点是否落在当前路径内。

## 6. 🤔 文本绘制有哪些关键属性？

2D 上下文可以通过 `fillText()` 和 `strokeText()` 绘制文本。两者都接收文本内容、坐标和可选的最大宽度。

```js
const canvas = document.querySelector('#drawing')
const context = canvas.getContext('2d')

context.font = 'bold 24px Arial'
context.textAlign = 'center'
context.textBaseline = 'middle'
context.fillText('12', 100, 30)
```

文本绘制主要受三个属性影响：

| 属性           | 作用                                      |
| -------------- | ----------------------------------------- |
| `font`         | 使用 CSS 字体语法指定字号、字重和字体族。 |
| `textAlign`    | 控制文本相对 `x` 坐标的水平对齐方式。     |
| `textBaseline` | 控制文本相对 `y` 坐标的垂直基线。         |

如果需要在限定宽度中排版，可以先用 `measureText()` 估算文本宽度。

```js
let fontSize = 48
const text = 'Hello world!'

context.font = `${fontSize}px Arial`

while (context.measureText(text).width > 180) {
  fontSize -= 1
  context.font = `${fontSize}px Arial`
}

context.fillText(text, 10, 60)
```

`fillText()` 和 `strokeText()` 的第四个参数可以指定最大绘制宽度。浏览器可能会压缩文本来适配这个宽度，但实际效果与浏览器实现有关。

## 7. 🤔 变换和状态栈怎么使用？

2D 上下文支持通过变换矩阵改变后续绘制结果。常用方法包括：

- `translate(left, top)`：移动坐标原点。
- `rotate(angle)`：围绕当前原点旋转，角度单位是弧度。
- `scale(scaleWidth, scaleHeight)`：缩放坐标系统。
- `transform(a, b, c, d, e, f)`：在当前变换基础上继续叠加矩阵。
- `setTransform(a, b, c, d, e, f)`：重置并设置变换矩阵。

```js
const canvas = document.querySelector('#drawing')
const context = canvas.getContext('2d')

context.translate(100, 100)
context.rotate(Math.PI / 6)
context.fillStyle = '#14b8a6'
context.fillRect(-40, -40, 80, 80)
```

变换会持续影响后续绘制。为了避免状态互相污染，可以使用 `save()` 和 `restore()` 管理状态栈。

```js
context.fillStyle = '#ef4444'
context.fillRect(0, 0, 60, 60)

context.save()
context.translate(100, 100)
context.rotate(Math.PI / 4)
context.fillStyle = '#2563eb'
context.fillRect(-30, -30, 60, 60)
context.restore()

context.fillStyle = '#16a34a'
context.fillRect(140, 0, 60, 60)
```

`save()` 保存的是绘图状态和变换，不保存已经绘制到画布上的像素内容。

## 8. 🤔 如何绘制图像和处理像素数据？

`drawImage()` 可以把图片、视频或另一个画布绘制到当前画布上。它有几种常见调用方式：

```js
context.drawImage(image, 10, 10)
context.drawImage(image, 10, 10, 120, 80)
context.drawImage(image, 0, 0, 200, 120, 20, 20, 100, 60)
```

三参数版本保持原图尺寸，五参数版本指定目标尺寸，九参数版本可以从源图像中裁切一块再绘制到目标区域。

如果画布没有被跨源资源污染，还可以使用 `getImageData()` 读取原始像素，再用 `putImageData()` 写回去。

```js
const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
const pixels = imageData.data

for (let index = 0; index < pixels.length; index += 4) {
  const red = pixels[index]
  const green = pixels[index + 1]
  const blue = pixels[index + 2]
  const gray = Math.floor((red + green + blue) / 3)

  pixels[index] = gray
  pixels[index + 1] = gray
  pixels[index + 2] = gray
}

context.putImageData(imageData, 0, 0)
```

`ImageData.data` 是一个按 RGBA 顺序排列的数组，每个像素占 4 项，取值范围是 `0` 到 `255`。

## 9. 🤔 阴影、渐变和图案怎么设置？

阴影由四个属性控制：

| 属性            | 作用           |
| --------------- | -------------- |
| `shadowColor`   | 阴影颜色。     |
| `shadowOffsetX` | 阴影水平偏移。 |
| `shadowOffsetY` | 阴影垂直偏移。 |
| `shadowBlur`    | 阴影模糊程度。 |

```js
context.shadowColor = 'rgba(0, 0, 0, 0.35)'
context.shadowOffsetX = 6
context.shadowOffsetY = 6
context.shadowBlur = 8
context.fillRect(20, 20, 100, 80)
```

渐变由 `CanvasGradient` 表示，可以赋给 `fillStyle` 或 `strokeStyle`。

```js
const gradient = context.createLinearGradient(20, 20, 140, 100)

gradient.addColorStop(0, '#ffffff')
gradient.addColorStop(1, '#111827')

context.fillStyle = gradient
context.fillRect(20, 20, 120, 80)
```

线性渐变使用 `createLinearGradient()`，径向渐变使用 `createRadialGradient()`。渐变坐标基于画布坐标，而不是基于即将绘制的图形，所以绘制位置和渐变范围要一起设计。

图案由 `createPattern()` 创建，通常基于图片、视频或另一个画布。

```js
const pattern = context.createPattern(image, 'repeat')

context.fillStyle = pattern
context.fillRect(0, 0, 200, 200)
```

第二个参数可以是 `repeat`、`repeat-x`、`repeat-y` 或 `no-repeat`。

## 10. 🤔 透明度和合成方式如何影响最终图形？

`globalAlpha` 控制后续所有绘制的全局透明度，取值范围是 `0` 到 `1`，默认值是 `1`。

```js
context.fillStyle = '#ef4444'
context.fillRect(10, 10, 80, 80)

context.globalAlpha = 0.5
context.fillStyle = '#2563eb'
context.fillRect(50, 50, 80, 80)

context.globalAlpha = 1
```

`globalCompositeOperation` 控制新图形如何与已经存在的像素合成。常见值包括：

| 值                 | 含义                                 |
| ------------------ | ------------------------------------ |
| `source-over`      | 默认值，新图形绘制在旧图形上方。     |
| `destination-over` | 新图形绘制在旧图形下方。             |
| `source-in`        | 只保留新旧图形重叠部分中的新图形。   |
| `destination-in`   | 只保留新旧图形重叠部分中的旧图形。   |
| `source-out`       | 只保留新图形中不与旧图形重叠的部分。 |
| `copy`             | 新图形替换旧图形。                   |
| `xor`              | 保留新旧图形不重叠的部分。           |
| `lighter`          | 重叠部分颜色相加，通常会变亮。       |

```js
context.fillStyle = '#ef4444'
context.fillRect(10, 10, 80, 80)

context.globalCompositeOperation = 'destination-over'
context.fillStyle = '#2563eb'
context.fillRect(50, 50, 80, 80)

context.globalCompositeOperation = 'source-over'
```

合成效果在不同浏览器历史实现中曾有差异。涉及复杂图像处理或设计工具时，最好在目标浏览器中做实际验证。
