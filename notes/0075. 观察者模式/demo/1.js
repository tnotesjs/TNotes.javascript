class Subject {
  constructor() {
    this.observers = [] // 观察者列表
  }

  // 添加观察者
  addObserver(observer) {
    this.observers.push(observer)
  }

  // 移除观察者
  removeObserver(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer)
  }

  // 通知所有观察者
  notify(data) {
    this.observers.forEach((observer) => observer.update(data))
  }
}

class Observer {
  constructor(name) {
    this.name = name
  }

  update(data) {
    console.log(`${this.name} 收到更新: ${data}`)
  }
}

// 使用示例
const subject = new Subject()

const observer1 = new Observer('观察者1')
const observer2 = new Observer('观察者2')

subject.addObserver(observer1)
subject.addObserver(observer2)

// 主题状态改变，通知所有观察者
subject.notify('新消息')

// output:
// 观察者1 收到更新: 新消息
// 观察者2 收到更新: 新消息