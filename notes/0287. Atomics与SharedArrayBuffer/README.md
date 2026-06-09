# [0287. Atomics与SharedArrayBuffer](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0287.%20Atomics%E4%B8%8ESharedArrayBuffer)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么共享内存会带来资源争用？](#3-为什么共享内存会带来资源争用)
- [4. `Atomics` 如何避免丢失更新？](#4-atomics-如何避免丢失更新)
- [5. `load()` 和 `store()` 为什么像读写屏障？](#5-load-和-store-为什么像读写屏障)
- [6. `exchange()` 和 `compareExchange()` 适合什么场景？](#6-exchange-和-compareexchange-适合什么场景)
- [7. `wait()` 和 `notify()` 如何协调执行？](#7-wait-和-notify-如何协调执行)
- [8. 使用这组 API 时要注意什么？](#8-使用这组-api-时要注意什么)

<!-- endregion:toc -->

## 1. 本节内容

- `SharedArrayBuffer` 与 `ArrayBuffer` 的区别
- 多执行上下文共享内存的资源争用问题
- `Atomics` 的原子读改写能力
- `load()`、`store()`、`exchange()`、`compareExchange()`
- `wait()` 和 `notify()` 的线程协调语义

## 2. 评价

- 这组 API 很底层，平时用得不多，但它揭示了浏览器并发编程中最硬核的问题：共享内存一旦出现，就必须认真处理同步。

## 3. 为什么共享内存会带来资源争用？

普通 `ArrayBuffer` 可以在线程或 Worker 之间转移，但转移后原上下文就不能继续使用那块内存。`SharedArrayBuffer` 不同，它允许多个执行上下文同时引用同一块内存。

这带来一个直接问题：多个上下文可能同时读写同一个位置。如果两个 Worker 都执行类似 `view[0] += 1` 的代码，那么读、加、写三个步骤之间可能被另一个线程打断，最终导致更新丢失。

```js
const buffer = new SharedArrayBuffer(4)
const sharedView = new Uint32Array(buffer)

sharedView[0] = 0
```

`SharedArrayBuffer` 自身只负责共享内存，不负责同步。真正用于协调共享内存访问的是 `Atomics`。

::: tip 注意

现代浏览器中，`SharedArrayBuffer` 通常要求页面处于跨源隔离环境，例如配置合适的 `Cross-Origin-Opener-Policy` 和 `Cross-Origin-Embedder-Policy`。这和安全防护有关，不能假设任意普通页面都能直接使用。

:::

## 4. `Atomics` 如何避免丢失更新？

`Atomics` 提供了一组原子操作。所谓原子操作，就是操作在共享内存上不可再拆分，中间不会被其他线程观察到半完成状态。

例如，多线程计数时不要写：

```js
sharedView[0] += 1
```

而应该写：

```js
Atomics.add(sharedView, 0, 1)
```

`Atomics.add()` 会把指定位置的值加上给定数值，并返回修改前的旧值。类似的读改写操作还有：

| 方法                              | 作用           |
| --------------------------------- | -------------- |
| `Atomics.add(view, index, value)` | 原子加。       |
| `Atomics.sub(view, index, value)` | 原子减。       |
| `Atomics.and(view, index, value)` | 原子按位与。   |
| `Atomics.or(view, index, value)`  | 原子按位或。   |
| `Atomics.xor(view, index, value)` | 原子按位异或。 |

这些方法适用于整数定型数组，例如 `Int32Array`、`Uint32Array`。共享内存通常要先用 `SharedArrayBuffer` 创建，再包一层定型数组视图。

## 5. `load()` 和 `store()` 为什么像读写屏障？

`Atomics.load()` 和 `Atomics.store()` 用于原子读取和原子写入。

```js
const currentValue = Atomics.load(sharedView, 0)

Atomics.store(sharedView, 0, currentValue + 1)
```

它们不只是普通读写，还提供了内存顺序保证。你可以把它们理解为共享内存上的明确读写边界：当多个线程通过 `Atomics` 读写同一块内存时，浏览器会按原子操作的语义协调可见性。

不过，如果读和写之间还有计算，`load()` 加 `store()` 并不能自动保证整个计算过程不可打断。计数这种场景仍然应该使用 `Atomics.add()` 这类读改写方法。

## 6. `exchange()` 和 `compareExchange()` 适合什么场景？

`Atomics.exchange()` 会把指定位置设置为新值，并返回旧值。

```js
const oldValue = Atomics.exchange(sharedView, 0, 1)
```

`Atomics.compareExchange()` 则是条件替换：只有当前位置的值等于预期值时，才会写入新值。无论是否写入，它都会返回旧值。

```js
const oldValue = Atomics.compareExchange(sharedView, 0, 0, 1)

if (oldValue === 0) {
  console.log('成功把状态从 0 改成 1')
}
```

这种模式常用于实现锁、状态机或只允许一个线程抢到任务的场景。

## 7. `wait()` 和 `notify()` 如何协调执行？

`Atomics.wait()` 可以让线程在某个位置的值仍然等于预期值时进入等待。`Atomics.notify()` 则可以唤醒等待在该位置上的线程。

```js
const sharedBuffer = new SharedArrayBuffer(4)
const sharedState = new Int32Array(sharedBuffer)

// Worker 中等待状态变化
Atomics.wait(sharedState, 0, 0)

// 另一个上下文中更新并通知
Atomics.store(sharedState, 0, 1)
Atomics.notify(sharedState, 0, 1)
```

`wait()` 只能用于 `Int32Array` 或 `BigInt64Array` 这类允许等待的共享定型数组视图。它会阻塞当前执行线程，因此不能随便在主线程中使用。实际项目中，这类 API 更适合 Worker 内部的高性能并发协调。

## 8. 使用这组 API 时要注意什么？

第一，只有共享内存才需要 `Atomics`。普通对象、普通数组和非共享 `ArrayBuffer` 不适用。

第二，共享内存会提高性能上限，也会显著提高复杂度。错误的同步逻辑很难排查。

第三，`Atomics` 是底层工具，不是应用层并发模型。多数 Web 应用使用消息传递、任务队列或 Worker 通信就足够了。

第四，安全上下文和跨源隔离要求必须提前确认。否则代码写对了，运行环境也可能不允许创建 `SharedArrayBuffer`。
