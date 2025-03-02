```bash
$ node index.js
./entry-file-1/index.js called
./entry-file-2/main.js called
```

- 在 entry-file-1 中，入口文件是 index.js
- 在 entry-file-2 中，入口文件是 main.js

通过对应目录下的 package.json 文件的 main 字段查看。

- `require('./entry-file-1')` 这种写法相当于直接引用 'entry-file-1' 下面的入口文件 index.js
- `require('./entry-file-2')` 这种写法相当于直接引用 'entry-file-2' 下面的入口文件 main.js
