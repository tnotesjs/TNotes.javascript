// 分批创建较小的数组来处理数据，并将它们保存下来
const batchSize = 1000000;
let totalElements = 4294967295;
let batches = Math.ceil(totalElements / batchSize);

const allBatches = []; // 用于保存所有批次的数组

for (let i = 0; i < batches; i++) {
  let batch = new Array(Math.min(batchSize, totalElements - i * batchSize)).fill(0);
  allBatches.push(batch);
  console.log(`Batch ${i + 1}: Array of length ${batch.length} created.`);
}

// 总元素数量
console.log(`Total elements processed: ${totalElements}`);
console.log(`Total batches: ${allBatches.length}`);