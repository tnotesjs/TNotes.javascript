```mermaid
timeline
    section Emit Events
      fn1: 10ms
      fn2: 100ms
      fn3: 300ms
      fn4: 330ms
      fn5: 370ms
      fn6: 550ms
```

```mermaid
timeline
    section Debounced Event
      fn2: 200ms
      fn5: 470ms
      fn6: 650ms
```

```mermaid
timeline
    section Throttled Events
      fn1: 10ms
      fn2: 110ms
      fn3: 300ms
      fn5: 400ms
      fn6: 550ms
```
