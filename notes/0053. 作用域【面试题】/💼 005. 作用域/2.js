var a = 1,
  b = 2

function m1() {
  var a
  console.log(a)
  a = 3
  function m2() {
    console.log(a, b)
  }
  m2()
}

m1()