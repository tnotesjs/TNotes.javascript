class MyButton extends HTMLElement {
    constructor() {
      super(); // 必须首先调用 super() 方法
      // 元素的初始化代码
    }

    connectedCallback() {
      this.innerHTML = `<button>Click me</button>`;
      this.querySelector('button').addEventListener('click', () => {
        alert('Button clicked!');
      });
    }
  }

  // 定义自定义元素
  customElements.define('my-button', MyButton);