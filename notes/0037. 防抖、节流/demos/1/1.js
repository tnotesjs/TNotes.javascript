function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, args)
    }, delay)
  }
}

const inputField = document.getElementById('inputField')
const output = document.getElementById('output')

function handleInput(event) {
  output.textContent = `输入的内容: ${event.target.value}`
}

const debouncedHandleInput = debounce(handleInput, 300)

inputField.addEventListener('input', debouncedHandleInput)
