// 区块 1
block1: {
  console.log(1)
}

// 区块 2
block2: {
  console.log(2)
  // 区块 3
  block3: {
    console.log(3)
    {
      // break block3 // ✅
      // break block2 // ✅
      // 随便套多少层都行，但是只能在当前所在的区块中跳。
    }
  }
  // 区块 4
  block4: {
    console.log(4)
    // break block2 // ✅
    // break block3 // ❌ 这里和 3 是平级的关系，不能跳。
    // 报错：
    // A 'break' statement can only jump to a label of an enclosing statement.
  }
}
