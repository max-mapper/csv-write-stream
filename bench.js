var csv = require('./')

var c = csv()
var obj = {
  hello: 'world',
  hej: 'med dig',
  lol: 'lulz',
  nu: 'yolo'
}

var i = 0

c.on('data', function(data) {
  i++
})

c.on('end', function() {
  console.log(i+' rows, time: '+(Date.now() - now))
})

var now = Date.now()

for (var i = 0; i < 2000000; i++) c.write(obj)
c.end()
