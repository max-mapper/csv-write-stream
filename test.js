var test = require('tape')
var csv = require('./')
var concat = require('concat-stream')

test('encode from basic array', function(t) {
  var writer = csv({ headers: ["hello", "foo"]})

  writer.pipe(concat(function(data) {
    t.equal('hello,foo\nworld,bar\n', data.toString())
    t.end()
  }))

  writer.write(["world", "bar"])
  writer.end()
})

test('encode from array w/ escaped quotes in header row', function(t) {
  var writer = csv({ headers: ['why "hello" there', "foo"]})

  writer.pipe(concat(function(data) {
    t.equal('"why ""hello"" there",foo\nworld,bar\n', data.toString())
    t.end()
  }))

  writer.write(["world", "bar"])
  writer.end()
})

test('encode from array w/ escaped quotes in cells', function(t) {
  var writer = csv({ headers: ["hello", "foo"]})

  writer.pipe(concat(function(data) {
    t.equal('hello,foo\nworld,"this is an ""escaped"" cell"\n', data.toString())
    t.end()
  }))

  writer.write(["world", 'this is an "escaped" cell'])
  writer.end()
})

test('encode from array w/ escaped newline in cells', function(t) {
  var writer = csv({ headers: ["hello", "foo"]})

  writer.pipe(concat(function(data) {
    t.equal('hello,foo\nworld,"this is a\nmultiline cell"\n', data.toString())
    t.end()
  }))

  writer.write(["world", 'this is a\nmultiline cell'])
  writer.end()
})

test('encode from array w/ escaped comma in cells', function(t) {
  var writer = csv({ headers: ["hello", "foo"]})

  writer.pipe(concat(function(data) {
    t.equal('hello,foo\nworld,"this is a cell with, commas, in it"\n', data.toString())
    t.end()
  }))

  writer.write(["world", 'this is a cell with, commas, in it'])
  writer.end()
})

test('encode from object w/ headers specified', function(t) {
  var writer = csv({ headers: ["hello", "foo"]})

  writer.pipe(concat(function(data) {
    t.equal('hello,foo\nworld,bar\n', data.toString())
    t.end()
  }))

  writer.write({hello: "world", foo: "bar", baz: "taco"})
  writer.end()
})

test('encode from object w/ auto headers', function(t) {
  var writer = csv()

  writer.pipe(concat(function(data) {
    t.equal('hello,foo,baz\nworld,bar,taco\n', data.toString())
    t.end()
  }))

  writer.write({hello: "world", foo: "bar", baz: "taco"})
  writer.end()
})

test('no headers specified', function(t) {
  var writer = csv()

  writer.on('error', function(err) {
    t.equal(err.message, 'no headers specified')
    t.end()
  })

  writer.write(['foo', 'bar'])
  writer.end()
})

test('no headers displayed', function(t) {
  var writer = csv({sendHeaders: false})

  writer.pipe(concat(function(data) {
    t.equal('world,bar,taco\n', data.toString())
    t.end()
  }))

  writer.write({hello: "world", foo: "bar", baz: "taco"})
  writer.end()
})

test('serialize falsy values', function (t) {
  // see https://github.com/maxogden/csv-write-stream/issues/8#issuecomment-41873534
  var writer = csv({
    headers: ['boolean','string','number','null','undefined'],
    sendHeaders: false
  })
  writer.pipe(concat(function (data) {
    t.equal('false,false,0,,\n', data.toString())
    t.end()
  }))

  writer.write([false,'false',0,null,undefined])
  writer.end()
})

test('handle objects and arrays', function (t) {
  var writer = csv({sendHeaders: false})

  writer.pipe(concat(function (data) {
    t.equal(data, '1,"1,2,3",[object Object]\n')
    t.end()
  }))

  writer.write({a: 1, b: [1,2,3], c: {d: 1}})
  writer.end()

})

test('destroy with error', function (t) {
  var writer = csv({sendHeaders: false})

  t.plan(2)

  writer.pipe(concat(function (data) {
    t.equal(data, '1,2\n', 'date received')
  }))

  writer.on('error', function (err) {
    writer.end()
    t.equal(err.message, 'error')
  })

  writer.write({a: 1, b : 2})
  writer.destroy(new Error('error'))

})

test('lots of cols', function (t) {
  var writer = csv()
  var obj = {}

  writer.pipe(concat(function (data) {
    t.equal(data, Object.keys(obj).join(',') + '\n' + Object.keys(obj).join(',') + '\n')
    t.end()
  }))

  for (var i = 0; i < 5000; i++) obj[i] = '' + i
  writer.write(obj)
  writer.end()
})
