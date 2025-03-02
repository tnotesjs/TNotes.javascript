class PubSub {
  constructor() {
    this.subscribers = {}
  }

  // 订阅方法
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = []
    }
    this.subscribers[event].push(callback)
  }

  // 发布方法
  publish(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach((callback) => {
        callback(data)
      })
    }
  }
}

const pubSub = new PubSub()

pubSub.subscribe('event1', (data) => console.log(`订阅者A: ${data}`)) // 订阅者A订阅了消息
pubSub.subscribe('event1', (data) => console.log(`订阅者B: ${data}`)) // 订阅者B订阅了消息

pubSub.publish('event1', 'hello world') // 发布消息

// output:
// 订阅者A: hello world
// 订阅者B: hello world