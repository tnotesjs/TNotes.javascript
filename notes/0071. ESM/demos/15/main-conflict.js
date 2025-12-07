// main-conflict.js - 测试命名冲突解决方案
import { add, conflictAdd, addModule, conflictModule } from './utils/index-conflict.js'

console.log('\n=== 命名冲突解决方案演示 ===\n')

// 方案 1：重命名导出
console.log('方案 1 - 重命名导出：')
console.log('add(1, 2) =', add(1, 2)) // 3
console.log('conflictAdd(1, 2) =', conflictAdd(1, 2)) // 103

console.log('\n方案 2 - 命名空间导出：')
console.log('addModule.add(1, 2) =', addModule.add(1, 2)) // 3
console.log('conflictModule.add(1, 2) =', conflictModule.add(1, 2)) // 103
