var stream = require('stream')
var util = require('util')
var gen = require('generate-object-property')

var CsvWriteStream = function(opts) {
  if (!opts) opts = {}
  stream.Transform.call(this, {objectMode:true, highWaterMark:16})

  this.sendHeaders = opts.sendHeaders !== false
  this.headers = opts.headers || null
  this.separator = opts.separator === undefined || opts.separator === null ? ',' : opts.separator
  this.sendMetadata = !!opts.sendMetadata
  this.newline = opts.newline || '\n'

  this._objRow = null
  this._arrRow = null
  this._first = true
  this._destroyed = false
}

util.inherits(CsvWriteStream, stream.Transform)

CsvWriteStream.prototype._compile = function(headers) {
  var newline = this.newline
  var sep = this.separator
  var str = 'function toRow(obj) {\n'

  if (!headers.length) str += '""'

  headers = headers.map(function(prop, i) {
    str += 'var a'+i+' = '+prop+' == null ? "" : '+prop+'\n'
    return 'a'+i
  })

  for (var i = 0; i < headers.length; i += 500) { // do not overflow the callstack on lots of cols
    var part = headers.length < 500 ? headers : headers.slice(i, i + 500)
    str += i ? 'result += "'+sep+'" + ' : 'var result = '
    part.forEach(function(prop, j) {
      str += (j ? '+"'+sep+'"+' : '') + '(/['+sep+'\\r\\n"]/.test('+prop+') ? esc('+prop+'+"") : '+prop+')'
    })
    str += '\n'
  }

  str += 'return result +'+JSON.stringify(newline)+'\n}'

  var escape = sep === '' ? noEsc : esc;
  return new Function('esc', 'return '+str)(escape)
}

CsvWriteStream.prototype._transform = function(row, enc, cb) {
  var isArray = Array.isArray(row)

  if (!isArray && !this.headers) this.headers = Object.keys(row)

  if (this._first) {
    this._first = false
    var objProps = []
    var arrProps = []

    if (this.headers) {
      for (var i = 0; i < this.headers.length; i++) {
        arrProps.push('obj['+i+']')
        objProps.push(gen('obj', this.headers[i]))
      }
      this._objRow = this._compile(objProps)
    } else {
      for (var j = 0; j < row.length; j++) {
        arrProps.push('obj['+j+']')
      }
      this.sendHeaders = false;
    }
    this._arrRow = this._compile(arrProps)

    if (this.sendMetadata && this.separator) this.push('sep=' + this.separator + this.newline)
    if (this.sendHeaders) this.push(this._arrRow(this.headers))
  }

  if (isArray) {
    this.push(this._arrRow(row))
  } else {
    if (!this.headers) return cb(new Error('no headers specified for object after the first element'))
    this.push(this._objRow(row))
  }

  cb()
}

CsvWriteStream.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true

  var self = this

  process.nextTick(function () {
    if (err) self.emit('error', err)
    self.emit('close')
  })
}

module.exports = function(opts) {
  return new CsvWriteStream(opts)
}

function esc(cell) {
  return '"'+cell.replace(/"/g, '""')+'"'
}
function noEsc(cell) {
  return cell;
}