// doc: [理解【观察者模式】和【发布订阅】的区别](https://juejin.cn/post/6978728619782701087)
// #region 发布订阅中心
class PubSub {
  constructor() {
    this.messages = {}
    this.listeners = {}
  }
  publish(type, content) {
    if (!this.messages[type]) {
      this.messages[type] = [content]
    } else {
      this.messages[type].push(content)
    }
  }
  subscribe(type, cb) {
    if (!this.listeners[type]) {
      this.listeners[type] = [cb]
    } else {
      this.listeners[type].push(cb)
    }
  }
  notify(type) {
    const messages = this.messages[type]
    const subscribers = this.listeners[type] || []
    subscribers.forEach((cb) => cb(messages))
  }
}
// #endregion 发布订阅中心

// #region 发布者
class Publisher {
  constructor(name, context) {
    this.name = name
    this.context = context
  }
  publish(type, content) {
    this.context.publish(type, content)
  }
}
// #endregion 发布者

// #region 订阅者
class Subscriber {
  constructor(name, context) {
    this.name = name
    this.context = context
  }
  subscribe(type, cb) {
    this.context.subscribe(type, cb)
  }
}
// #endregion 订阅者

// #region 使用示例
const TYPE_A = '音乐'
const TYPE_B = '电影'
const TYPE_C = '小说'

const pubsub = new PubSub() // 订阅发布中心

// 订阅（预订）
const subscriberA = new Subscriber('订阅者 A', pubsub)
subscriberA.subscribe(TYPE_A, (res) => {
  console.log(`【订阅者 A】收到了【${TYPE_A}】：`, res)
})
const subscriberB = new Subscriber('订阅者 B', pubsub)
subscriberB.subscribe(TYPE_C, (res) => {
  console.log(`【订阅者 B】收到了【${TYPE_C}】：`, res)
})
const subscriberC = new Subscriber('订阅者 C', pubsub)
subscriberC.subscribe(TYPE_B, (res) => {
  console.log(`【订阅者 C】收到了【${TYPE_B}】：`, res)
})

// 发布（出版）
const publisherA = new Publisher('出版方 A', pubsub)
publisherA.publish(TYPE_A, '歌曲 1')
publisherA.publish(TYPE_B, '电影 1')
const publisherB = new Publisher('出版方 B', pubsub)
publisherB.publish(TYPE_A, '歌曲 2')
const publisherC = new Publisher('出版方 C', pubsub)
publisherC.publish(TYPE_B, '电影 2')

// 通知
pubsub.notify(TYPE_A)
pubsub.notify(TYPE_B)
pubsub.notify(TYPE_C)
// #endregion 使用示例

// output:
// 【订阅者 A】收到了【音乐】消息： [ '歌曲 1', '歌曲 2' ]
// 【订阅者 C】收到了【电影】消息： [ '电影 1', '电影 2' ]
// 【订阅者 B】收到了【小说】消息： undefined
