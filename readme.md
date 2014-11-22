# csv-write-stream

A CSV encoder stream that produces properly escaped CSVs.

[![NPM](https://nodei.co/npm/csv-write-stream.png)](https://nodei.co/npm/csv-write-stream/)

[![browser support](http://ci.testling.com/maxogden/csv-write-stream.png)](http://ci.testling.com/maxogden/csv-write-stream)

A through stream. Write arrays of strings (or JS objects) and you will receive a properly escaped CSV stream out the other end.

### usage

##### var writer = csvWriter([options])

```js
var csvWriter = require('csv-write-stream')
var writer = csvWriter()
```

`writer` is a duplex stream -- you can pipe data to it and it will emit a string for each line of the CSV

#### default options

```js
{
  separator: ',',
  newline: '\n',
  headers: undefined,
  sendHeaders: true
}
```

`headers` can be an array of strings to use as the header row. if you don't specify a header row the keys of the first row written to the stream will be used as the header row IF the first row is an object (see the test suite for more details). if the `sendHeaders` option is set to false, the headers will be used for ordering the data but will never be written to the stream.

example of auto headers:

```js
var writer = csv()
writer.pipe(fs.createWriteStream('out.csv'))
writer.write({hello: "world", foo: "bar", baz: "taco"})
writer.end()

// produces: hello,foo,baz\nworld,bar,taco\n
```

example of specifying headers:

```js
var writer = csv({ headers: ["hello", "foo"]})
writer.pipe(fs.createWriteStream('out.csv'))
writer.write(['world', 'bar'])
writer.end()

// produces: hello,foo\nworld,bar\n
```

example of not sending headers:

```js
var writer = csv({sendHeaders: false})
writer.pipe(fs.createWriteStream('out.csv'))
writer.write({hello: "world", foo: "bar", baz: "taco"})
writer.end()

// produces: world,bar,taco\n
```

see the test suite for more examples

### run the test suite

```bash
$ npm install
$ npm test
```

### cli usage

This module also includes a CLI, which you can pipe [ndjson](http://ndjson.org) 
to stdin and it will print csv on stdout. You can install it with 
`npm install -g csv-write-stream`.

```
cat example.ndjson | csv-write-stream > example.csv
```
