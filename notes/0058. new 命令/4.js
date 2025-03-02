var Vehicle = function (){
  this.price = 1000;
  return { price: 2000 };
  // 这里返回的是一个对象，因此 new Vehicle() 的返回值是这个对象，而非 this
};

console.log((new Vehicle()).price)
// 2000