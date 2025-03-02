// #region 被观察者对象
class Subject {
  constructor() {
    this.observerList = []
  }

  addObserver(observer) {
    this.observerList.push(observer)
  }

  removeObserver(observer) {
    const index = this.observerList.findIndex((o) => o.name === observer.name)
    this.observerList.splice(index, 1)
  }

  notifyObservers(message) {
    this.observerList.forEach((observer) => observer.notified(message))
  }
}
// #endregion 被观察者对象

// #region 观察者
class Observer {
  constructor(name, subject) {
    this.name = name
    if (subject) {
      subject.addObserver(this)
    }
  }

  notified(message) {
    console.log(this.name, '收到消息：', message)
  }
}
// #endregion 观察者

const subject = new Subject()

const observerA = new Observer('观察者 A', subject)
const observerB = new Observer('观察者 B')

subject.addObserver(observerB)
subject.notifyObservers('通知 1')

subject.removeObserver(observerA)
subject.notifyObservers('通知 2')

// output:
// 观察者 A 收到消息： 通知 1
// 观察者 B 收到消息： 通知 1
// 观察者 B 收到消息： 通知 2