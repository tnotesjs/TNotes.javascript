# [0277. WebGL](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0277.%20WebGL)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. WebGL 是什么？](#3-webgl-是什么)
- [4. 如何取得 WebGL 上下文？](#4-如何取得-webgl-上下文)
- [5. WebGL 的常量、命名和视口有什么特点？](#5-webgl-的常量命名和视口有什么特点)
- [6. 缓冲区和定型数组有什么关系？](#6-缓冲区和定型数组有什么关系)
- [7. WebGL 如何报告错误？](#7-webgl-如何报告错误)
- [8. 着色器和程序如何组成绘图管线？](#8-着色器和程序如何组成绘图管线)
- [9. WebGL 如何绘图、使用纹理和读取像素？](#9-webgl-如何绘图使用纹理和读取像素)
- [10. WebGL1 和 WebGL2 有哪些差异？](#10-webgl1-和-webgl2-有哪些差异)

<!-- endregion:toc -->

## 1. 本节内容

- WebGL 与 OpenGL ES 的关系
- WebGL 上下文、选项、常量和方法命名
- 清空画布、视口、缓冲区和错误检查
- GLSL、着色器、程序、uniform 和 attribute
- 绘图、纹理、像素读取与 WebGL1 / WebGL2 差异

## 2. 评价

- WebGL 很容易让人觉得陡峭，因为它不是普通 DOM API，而是一套图形管线接口；先抓住上下文、缓冲区、着色器和绘图命令这几根主线，理解成本会低很多。

## 3. WebGL 是什么？

WebGL 是 `<canvas>` 的 3D 绘图上下文。它不是 W3C 制定的标准，而是由 Khronos Group 维护，基础来自 OpenGL ES。简单来说，WebGL 把一部分图形硬件能力暴露给浏览器，让 JavaScript 可以通过 GPU 绘制 2D 或 3D 图形。

WebGL 和 2D 上下文的思维方式很不一样：

| 2D 上下文 | WebGL |
| --- | --- |
| 直接调用 API 绘制矩形、路径、文本和图片。 | 准备顶点、缓冲区、着色器和绘图命令。 |
| 更像画布 API。 | 更像图形管线 API。 |
| 适合常规 2D 绘图。 | 适合 3D、高性能图形和复杂视觉效果。 |

本书不会完整展开 OpenGL ES 的所有概念，而是从浏览器中使用 WebGL 的角度介绍必要基础。

## 4. 如何取得 WebGL 上下文？

WebGL 上下文同样通过 `<canvas>` 的 `getContext()` 获取。常见名称包括 `webgl` 和 `webgl2`。

```js
const canvas = document.querySelector('#drawing')

let gl = null

if (canvas.getContext) {
  try {
    gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  } catch (error) {
    gl = null
  }
}

if (!gl) {
  console.warn('当前环境无法创建 WebGL 上下文')
}
```

很多 WebGL 示例会把上下文变量命名为 `gl`，因为 WebGL 的方法和常量来自 OpenGL 体系，这样写更接近图形 API 的惯例。

创建上下文时也可以传入选项：

```js
const gl = canvas.getContext('webgl', {
  alpha: false,
  depth: true,
  stencil: false,
  antialias: true,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
})
```

常见选项含义如下：

| 选项                    | 含义                           |
| ----------------------- | ------------------------------ |
| `alpha`                 | 是否创建透明通道。             |
| `depth`                 | 是否启用深度缓冲区。           |
| `stencil`               | 是否启用模板缓冲区。           |
| `antialias`             | 是否启用抗锯齿。               |
| `premultipliedAlpha`    | 绘图缓冲区是否预乘透明度。     |
| `preserveDrawingBuffer` | 绘图完成后是否保留缓冲区内容。 |

多数场景使用默认值即可，尤其不要随意打开 `preserveDrawingBuffer`，因为它可能影响性能。

## 5. WebGL 的常量、命名和视口有什么特点？

OpenGL 中很多常量以 `GL_` 开头，WebGL 中则通过上下文对象访问，并去掉 `GL_` 前缀。例如 OpenGL 的 `GL_COLOR_BUFFER_BIT` 在 WebGL 中写作 `gl.COLOR_BUFFER_BIT`。

```js
gl.clearColor(0, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
```

很多 WebGL 方法名也包含参数类型信息。例如：

- `uniform4f()`：传入 4 个浮点数。
- `uniform3i()`：传入 3 个整数。
- `uniform4fv()`：传入包含 4 个浮点数的向量数组。

绘图前通常要设置视口。视口定义了 WebGL 在画布中的绘制区域。

```js
gl.viewport(0, 0, canvas.width, canvas.height)
```

这里容易混淆两套坐标：

- 定义视口时，`(0, 0)` 是 `<canvas>` 左下角。
- 在视口内部绘图时，裁剪空间中心是 `(0, 0)`，左下角是 `(-1, -1)`，右上角是 `(1, 1)`。

也就是说，WebGL 的默认绘制坐标不是网页里的像素坐标，而是图形管线中的裁剪坐标。

## 6. 缓冲区和定型数组有什么关系？

WebGL 绘图需要把顶点数据交给 GPU。JavaScript 里的顶点数据通常保存在定型数组中，例如 `Float32Array`。然后再通过缓冲区传给 WebGL。

```js
const vertices = new Float32Array([0, 1, 1, -1, -1, -1])

const vertexBuffer = gl.createBuffer()

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
```

`bindBuffer()` 会把某个缓冲区绑定为当前操作目标。之后调用 `bufferData()` 时，数据会写入当前绑定的缓冲区。

`bufferData()` 的最后一个参数描述数据使用方式：

| 常量              | 含义                             |
| ----------------- | -------------------------------- |
| `gl.STATIC_DRAW`  | 数据加载一次，会被多次绘制使用。 |
| `gl.STREAM_DRAW`  | 数据加载一次，只会被少量使用。   |
| `gl.DYNAMIC_DRAW` | 数据会反复修改，并被多次使用。   |

如果缓冲区不再使用，最好手动释放：

```js
gl.deleteBuffer(vertexBuffer)
```

WebGL 资源通常跟上下文生命周期绑定。页面卸载会释放资源，但长期运行的应用仍然应该主动清理不用的缓冲区、纹理和程序。

## 7. WebGL 如何报告错误？

WebGL 的很多错误不会像普通 JavaScript 那样直接抛异常。你需要调用 `gl.getError()` 查询最近的错误状态。

```js
let errorCode = gl.getError()

while (errorCode !== gl.NO_ERROR) {
  console.warn('WebGL error:', errorCode)
  errorCode = gl.getError()
}
```

常见错误包括：

| 常量                    | 含义                        |
| ----------------------- | --------------------------- |
| `gl.NO_ERROR`           | 没有错误。                  |
| `gl.INVALID_ENUM`       | 参数不是合法的 WebGL 常量。 |
| `gl.INVALID_VALUE`      | 参数值不合法。              |
| `gl.INVALID_OPERATION`  | 当前状态下不能执行该操作。  |
| `gl.OUT_OF_MEMORY`      | 内存不足。                  |
| `gl.CONTEXT_LOST_WEBGL` | WebGL 上下文丢失。          |

调试 WebGL 时，错误检查很重要。一个状态设置错误可能不会立刻暴露，却会导致后续绘制完全没有输出。

## 8. 着色器和程序如何组成绘图管线？

WebGL 中至少需要两类着色器：

- 顶点着色器：把顶点转换为可以绘制的位置。
- 片段着色器：决定每个像素片段的颜色。

着色器使用 GLSL 编写，不是 JavaScript。为了避免在 Markdown 中写真实脚本标签，下面用字符串保存 GLSL 源码：

```js
const vertexShaderSource = `
attribute vec2 aVertexPosition;

void main() {
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision mediump float;
uniform vec4 uColor;

void main() {
  gl_FragColor = uColor;
}
`
```

创建着色器的基本步骤是：创建、设置源码、编译。

```js
function createShader(gl, type, source) {
  const shader = gl.createShader(type)

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(message)
  }

  return shader
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
const fragmentShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource,
)
```

着色器还需要链接成程序，之后通过 `useProgram()` 使用：

```js
const program = gl.createProgram()

gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program))
}

gl.useProgram(program)
```

给着色器传值时，`uniform` 和 `attribute` 走不同路径：

```js
const colorLocation = gl.getUniformLocation(program, 'uColor')

gl.uniform4fv(colorLocation, [0, 0, 0, 1])

const positionLocation = gl.getAttribLocation(program, 'aVertexPosition')

gl.enableVertexAttribArray(positionLocation)
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
```

`uniform` 适合传递常量，例如颜色、矩阵、时间。`attribute` 适合传递每个顶点不同的数据，例如顶点位置。

## 9. WebGL 如何绘图、使用纹理和读取像素？

WebGL 最终只能直接绘制点、线和三角形。其他复杂形状都要拆成这些基本图元。

常见绘图常量包括：

| 常量                | 含义                                   |
| ------------------- | -------------------------------------- |
| `gl.POINTS`         | 把每个顶点绘制成点。                   |
| `gl.LINES`          | 每两个顶点绘制一条线段。               |
| `gl.LINE_LOOP`      | 顶点首尾相连，形成闭合折线。           |
| `gl.LINE_STRIP`     | 顶点依次相连，形成不闭合折线。         |
| `gl.TRIANGLES`      | 每三个顶点绘制一个独立三角形。         |
| `gl.TRIANGLE_STRIP` | 后续顶点复用前两个顶点组成连续三角形。 |
| `gl.TRIANGLE_FAN`   | 后续顶点与第一个顶点组成扇形三角形。   |

```js
const vertexSize = 2
const vertexCount = vertices.length / vertexSize

gl.drawArrays(gl.TRIANGLES, 0, vertexCount)
```

纹理可以来自图片、视频或另一个画布。常见流程是创建纹理、绑定纹理、设置像素存储方式、上传图片、设置过滤方式。

```js
const image = new Image()

image.crossOrigin = 'anonymous'
image.src = '/textures/smile.png'

image.addEventListener('load', () => {
  const texture = gl.createTexture()

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.bindTexture(gl.TEXTURE_2D, null)
})
```

`gl.UNPACK_FLIP_Y_WEBGL` 很常见，因为图片资源的坐标方向和 WebGL 纹理坐标方向并不总是一致。

读取像素使用 `readPixels()`。最后一个参数必须是合适的定型数组。

```js
const pixels = new Uint8Array(25 * 25 * 4)

gl.readPixels(0, 0, 25, 25, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
```

如果希望绘制完成后还能读取上一帧内容，可能需要创建上下文时设置 `preserveDrawingBuffer: true`，但这个选项会影响性能，应该谨慎使用。

## 10. WebGL1 和 WebGL2 有哪些差异？

WebGL1 代码大多可以迁移到 WebGL2。主要差异之一是，WebGL1 中很多能力需要通过扩展启用，而 WebGL2 把不少扩展能力变成了标准功能。

```js
const drawBuffersExtension = gl.getExtension('WEBGL_draw_buffers')

if (drawBuffersExtension) {
  drawBuffersExtension.drawBuffersWEBGL([
    drawBuffersExtension.COLOR_ATTACHMENT0_WEBGL,
  ])
}
```

在 WebGL2 中，类似能力可以直接通过上下文对象使用：

```js
gl.drawBuffers([gl.COLOR_ATTACHMENT0])
```

WebGL2 还升级到 GLSL 3.00 ES。升级版着色器通常需要在第一行声明版本：

```glsl
#version 300 es
```

同时语法也有变化，例如：

- 顶点 `attribute` 改用 `in`。
- `varying` 根据方向改为 `in` 或 `out`。
- 片段着色器不再使用 `gl_FragColor`，需要自己声明输出变量。
- `texture2D()` 和 `textureCube()` 统一为 `texture()`。

WebGL2 更强，但也意味着你需要确认目标浏览器、设备和图形驱动是否稳定支持。实际项目中，很多团队会使用 Three.js 等库来封装底层差异，把注意力放在场景、材质、相机和资源管理上。
